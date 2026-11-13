import { faker } from "@faker-js/faker";
import { CATEGORY_TEMPLATES, type CategoryTemplate } from "./category-templates.js";
import { resolveProductImages } from "./image-catalogs.js";
import { Prisma } from "@prisma/client";

export interface GenerateProductOptions {
    index: number;
    category?: string;
    jobId?: string;
    seed?: number;
    includeVariations?: boolean;
}

const MARKETPLACE_VENDORS_3P = [
    { name: "Apex Global Gadgets", rating: 96 },
    { name: "Lagos Tech & Sound Hub", rating: 98 },
    { name: "Nordic Atelier Living", rating: 94 },
    { name: "Heritage Timepieces & Gems", rating: 99 },
    { name: "Sahara Fit & Athletics", rating: 95 },
    { name: "Volt Automotives NG", rating: 97 },
    { name: "Urban Essence Cosmetics", rating: 93 },
    { name: "Prime Kitchen & Living Co.", rating: 97 },
    { name: "Aura Luxury Fashion Store", rating: 98 },
    { name: "Titan Tools & Equipment", rating: 96 },
];

const BUNDLE_INCENTIVES = [
    "+ FREE 43\" SMART TV on Orders Over ₦500,000",
    "+ FREE Qi2 Fast Charge Dock & Cable",
    "+ FREE Silk Care Travel Kit",
    "+ FREE Professional Installation & Delivery",
    "+ FREE 64GB High-Speed Memory Card",
    "+ Extra 1-Year Extended Care Warranty",
    null,
    null,
    null,
];

/**
 * Creates a slug from a product name and a unique identifier.
 */
function slugify(name: string, uid: string): string {
    const clean = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
        .slice(0, 70);
    return `${clean}-${uid}`;
}

/**
 * Generates a single Prisma-compatible Product record.
 */
export function generateSingleProduct(options: GenerateProductOptions): Prisma.ProductCreateManyInput {
    const { index, category: specifiedCategory, jobId, seed, includeVariations = true } = options;

    if (seed !== undefined) {
        faker.seed(seed + index);
    }

    // Determine category
    const categoryKeys = Object.keys(CATEGORY_TEMPLATES);
    const categoryName =
        specifiedCategory && CATEGORY_TEMPLATES[specifiedCategory]
            ? specifiedCategory
            : categoryKeys[index % categoryKeys.length];

    const template: CategoryTemplate = CATEGORY_TEMPLATES[categoryName] || CATEGORY_TEMPLATES["Electronics"];

    const subcategory = faker.helpers.arrayElement(template.subcategories);
    const brand = faker.helpers.arrayElement(template.brands);
    const code = template.code;

    // Realistic model descriptors
    const modelDescriptor = faker.helpers.arrayElement([
        "Pro Edition",
        "Max Ultra",
        "Elite Series",
        "Signature Line",
        "Studio Classic",
        "Carbon Edition",
        "Prime Stealth",
        "Aero Sport",
        "Masterwork 2026",
    ]);

    const productName = `${brand} ${subcategory} - ${modelDescriptor}`;
    const uniqueHash = faker.string.alphanumeric({ length: 6, casing: "lower" });
    const productSlug = slugify(productName, `${index}-${uniqueHash}`);

    // Realistic SKU: VRM-{CODE}-{INDEX}-{RANDOM}
    const sku = `VRM-${code}-${String(index + 1).padStart(6, "0")}-${faker.string.alphanumeric({ length: 4, casing: "upper" })}`;

    // Pricing (NGN)
    const [minPrice, maxPrice] = template.priceRange;
    const rawPrice = faker.number.int({ min: minPrice, max: maxPrice });
    // Round to clean 100 or 500 NGN
    const price = Math.round(rawPrice / 500) * 500;

    // Selective discount (60% chance of having an original higher price)
    const hasDiscount = faker.datatype.boolean(0.6);
    const discountMultiplier = hasDiscount ? faker.number.float({ min: 1.12, max: 1.45, fractionDigits: 2 }) : 1;
    const originalPrice = hasDiscount ? Math.round((price * discountMultiplier) / 500) * 500 : null;

    // Multi-angle images
    const imagesMeta = resolveProductImages(categoryName, index);

    // Realistic weight and dimensions
    const [minWeight, maxWeight] = template.weightRange;
    const weight = faker.number.float({ min: minWeight, max: maxWeight, fractionDigits: 2 });
    const dimensions = {
        length: faker.number.int({ min: 10, max: 80 }),
        width: faker.number.int({ min: 10, max: 60 }),
        height: faker.number.int({ min: 5, max: 50 }),
        unit: "cm",
    };

    // Category-specific specifications
    const specs = template.generateSpecs(brand, subcategory);

    // Variations (colors, sizes, materials)
    const variations = includeVariations
        ? template.generateVariations()
        : { sizes: ["Standard"], colors: [{ name: "Default", hex: "#111111" }] };

    // Seller metadata (70% 1P Vroom Direct, 30% 3P Marketplace)
    const is1P = faker.datatype.boolean(0.7);
    const seller = is1P
        ? { type: "1P", name: "Vroom Direct", rating: 100, fulfilled: true }
        : (() => {
              const vendor = faker.helpers.arrayElement(MARKETPLACE_VENDORS_3P);
              return {
                  type: "3P",
                  name: vendor.name,
                  rating: vendor.rating,
                  fulfilled: faker.datatype.boolean(0.85),
              };
          })();

    const warranty = faker.helpers.arrayElement([
        "+ 12 Month Warranty",
        "+ 2-Year Warranty",
        "1-Year Official Brand Warranty",
        "Lifetime Craftsmanship Guarantee",
    ]);

    const bundledIncentive = faker.helpers.arrayElement(BUNDLE_INCENTIVES);

    // Payment on Delivery (PoD) eligibility (all items <= 25kg are eligible)
    const isPodEligible = weight <= 25;
    const podTerms = isPodEligible
        ? "Pay upon doorstep delivery via POS or cash in Lagos, Abuja & PH."
        : "Direct dispatch prepayment required for heavy items over 25kg.";

    const rating = faker.number.float({ min: 4.1, max: 5.0, fractionDigits: 1 });
    const reviewCount = faker.number.int({ min: 3, max: 380 });
    const stock = faker.number.int({ min: 5, max: 200 });

    const description = `${productName} is engineered with premium grade materials and precision architecture. Designed for uncompromising performance, daily durability, and modern aesthetic elegance. Features certified ${brand} standards, full warranty assurance, and seamless local support.`;

    return {
        sku,
        name: productName,
        slug: productSlug,
        description,
        price: new Prisma.Decimal(price),
        originalPrice: originalPrice ? new Prisma.Decimal(originalPrice) : null,
        image: imagesMeta.primary,
        images: imagesMeta.gallery,
        category: categoryName,
        subcategory,
        brand,
        stock,
        tag: hasDiscount ? "SALE" : null,
        sizes: variations.sizes || [],
        colors: (variations.colors as unknown as Prisma.InputJsonValue) || Prisma.JsonNull,
        material: variations.material || null,
        fitGuide: variations.fitGuide || null,
        specs: (specs as unknown as Prisma.InputJsonValue) || Prisma.JsonNull,
        dimensions: (dimensions as unknown as Prisma.InputJsonValue) || Prisma.JsonNull,
        weight,
        sellerType: seller.type,
        sellerName: seller.name,
        sellerRating: seller.rating,
        isFulfilledByVroom: seller.fulfilled,
        warranty,
        bundledIncentive,
        isPodEligible,
        podTerms,
        rating,
        reviewCount,
        isDemo: true,
        jobId: jobId || null,
        isActive: true,
    };
}
