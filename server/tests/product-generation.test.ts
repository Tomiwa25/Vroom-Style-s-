import { describe, it, expect, beforeEach } from "vitest";
import { CATEGORY_TEMPLATES } from "../src/services/catalog-generator/category-templates.js";
import { resolveProductImages, FALLBACK_PRODUCT_IMAGE } from "../src/services/catalog-generator/image-catalogs.js";
import { generateSingleProduct } from "../src/services/catalog-generator/product-generator.js";
import { ProductGenerationService } from "../src/services/product-generation.service.js";
import { getProducts, searchProductsService } from "../src/services/product.service.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";

describe("Product Catalog Generation & Seeding Engine", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    describe("Category Templates & Curated Image Catalogs", () => {
        it("defines all 20 required marketplace categories", () => {
            const expectedCategories = [
                "Electronics",
                "Phones and Tablets",
                "Computers and Accessories",
                "Fashion",
                "Shoes and Bags",
                "Beauty and Personal Care",
                "Home and Kitchen",
                "Furniture",
                "Sports and Fitness",
                "Automotive",
                "Gaming",
                "Books and Stationery",
                "Baby Products",
                "Toys",
                "Health and Wellness",
                "Groceries",
                "Home Appliances",
                "Office Equipment",
                "Jewelry and Watches",
                "Tools and Home Improvement",
            ];

            const definedCategories = Object.keys(CATEGORY_TEMPLATES);
            for (const cat of expectedCategories) {
                expect(definedCategories).toContain(cat);
                const template = CATEGORY_TEMPLATES[cat];
                expect(template.subcategories.length).toBeGreaterThan(0);
                expect(template.brands.length).toBeGreaterThan(0);
                expect(template.priceRange[0]).toBeGreaterThan(0);
                expect(template.priceRange[1]).toBeGreaterThan(template.priceRange[0]);
                expect(template.weightRange[0]).toBeGreaterThan(0);
            }
        });

        it("resolves multi-angle images with valid primary and gallery arrays for every category", () => {
            const categories = Object.keys(CATEGORY_TEMPLATES);
            for (const cat of categories) {
                const images = resolveProductImages(cat, 0);
                expect(images.primary).toBeTruthy();
                expect(images.primary).toMatch(/^https?:\/\//);
                expect(Array.isArray(images.gallery)).toBe(true);
                expect(images.gallery.length).toBeGreaterThanOrEqual(1);
            }

            // Fallback safety
            const unknownImages = resolveProductImages("UnknownNonExistentCategory", 99);
            expect(unknownImages.primary).toBeDefined();
            expect(unknownImages.gallery.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Deterministic Product Generator", () => {
        it("generates deterministic records when seed is specified", () => {
            const productA = generateSingleProduct({
                index: 0,
                category: "Electronics",
                seed: 12345,
            });

            const productB = generateSingleProduct({
                index: 0,
                category: "Electronics",
                seed: 12345,
            });

            expect(productA.name).toBe(productB.name);
            expect(productA.sku).toBe(productB.sku);
            expect(productA.price.toString()).toBe(productB.price.toString());
            expect(productA.brand).toBe(productB.brand);
            expect(productA.subcategory).toBe(productB.subcategory);
        });

        it("produces valid marketplace records with multi-angle imagery, warranty, and PoD eligibility", () => {
            const product = generateSingleProduct({
                index: 42,
                category: "Automotive",
            });

            expect(product.sku).toMatch(/^VRM-AUTO-\d{6}-[A-Z0-9]{4}$/);
            expect(product.name).toContain(product.brand!);
            expect(product.category).toBe("Automotive");
            expect(Number(product.price)).toBeGreaterThanOrEqual(25000);
            expect(product.images!.length).toBeGreaterThanOrEqual(2);
            expect(product.isDemo).toBe(true);
            expect(product.rating).toBeGreaterThanOrEqual(4.0);
            expect(product.reviewCount).toBeGreaterThan(0);
            expect(product.warranty).toBeTruthy();
            expect(product.sellerType).toMatch(/^(1P|3P)$/);
            expect(product.isPodEligible).toBeDefined();
        });
    });

    describe("Batch Bulk Insertion Engine & ProductGenerationService", () => {
        it("executes streaming batch generation and tracks job status in database", async () => {
            const targetCount = 25;
            const result = await ProductGenerationService.executeGeneration({
                count: targetCount,
                categories: ["Phones and Tablets", "Gaming"],
                batchSize: 10,
                seed: 999,
            });

            expect(result.totalGenerated).toBe(targetCount);
            expect(result.durationMs).toBeGreaterThan(0);

            // Verify in database
            const job = await ProductGenerationService.getJob(result.jobId);
            expect(job).not.toBeNull();
            expect(job?.status).toBe("COMPLETED");
            expect(job?.totalGenerated).toBe(targetCount);

            // Verify products exist in database and match criteria
            const productsInDb = await prisma.product.findMany({
                where: { jobId: result.jobId },
            });
            expect(productsInDb.length).toBe(targetCount);
            expect(productsInDb.every((p) => p.isDemo === true)).toBe(true);

            // Verify products appear in catalog service query
            const catalog = await getProducts(50, 0, { category: "Gaming" });
            expect(catalog.total).toBeGreaterThan(0);
            expect(catalog.products.some((p) => p.category === "Gaming")).toBe(true);
        });

        it("safely cleans demo products per job while protecting active orders", async () => {
            // 1. Generate 10 demo products
            const genResult = await ProductGenerationService.executeGeneration({
                count: 10,
                categories: ["Fashion"],
                batchSize: 5,
            });

            const demoProducts = await prisma.product.findMany({
                where: { jobId: genResult.jobId },
            });
            expect(demoProducts.length).toBe(10);

            // 2. Simulate customer ordering one demo product
            const user = await prisma.user.create({
                data: {
                    email: "customer-order@test.com",
                    password: "hash",
                    firstName: "Customer",
                    lastName: "Tester",
                },
            });

            const order = await prisma.order.create({
                data: {
                    userId: user.id,
                    total: 50000,
                    status: "DELIVERED",
                    shippingAddress: "12 Marina Rd, Lagos, Nigeria",
                },
            });

            const protectedProduct = demoProducts[0];
            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: protectedProduct.id,
                    quantity: 1,
                    price: 50000,
                },
            });

            // 3. Trigger safe deletion of demo products for this job
            const deleteResult = await ProductGenerationService.deleteJobDemoProducts(genResult.jobId);
            expect(deleteResult.deletedCount).toBe(9);
            expect(deleteResult.preservedCount).toBe(1);

            // 4. Verify protected product was preserved (and deactivated)
            const preservedCheck = await prisma.product.findUnique({
                where: { id: protectedProduct.id },
            });
            expect(preservedCheck).not.toBeNull();
            expect(preservedCheck?.isActive).toBe(false);

            // 5. Verify the other 9 demo items were hard deleted
            const remainingCount = await prisma.product.count({
                where: { jobId: genResult.jobId, id: { not: protectedProduct.id } },
            });
            expect(remainingCount).toBe(0);
        });

        it("searches and filters generated catalog items by brand, sku, and specs", async () => {
            await ProductGenerationService.executeGeneration({
                count: 15,
                categories: ["Computers and Accessories"],
                seed: 888,
            });

            const sample = await prisma.product.findFirst({
                where: { category: "Computers and Accessories" },
            });
            expect(sample).not.toBeNull();

            // Search by SKU
            const searchBySku = await searchProductsService(sample!.sku!.slice(0, 10));
            expect(searchBySku.total).toBeGreaterThanOrEqual(1);

            // Search by Brand
            if (sample?.brand) {
                const searchByBrand = await searchProductsService(sample.brand);
                expect(searchByBrand.total).toBeGreaterThanOrEqual(1);
            }
        });
    });
});
