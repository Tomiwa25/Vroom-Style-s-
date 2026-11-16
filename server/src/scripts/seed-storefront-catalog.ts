import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import prisma from "../config/database.js";

interface ProductSeed {
  id: string;
  externalId?: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  brand?: string;
  stock: number;
  tag?: string;
  sizes?: string[];
  colors?: any;
  material?: string;
  fitGuide?: string;
  specs?: any;
  isPodEligible?: boolean;
  sellerType?: string;
  sellerName?: string;
  sellerRating?: number;
}

function parseProductsFromTs(filePath: string): ProductSeed[] {
  const content = fs.readFileSync(filePath, "utf8");
  // Find JSON array within export const ...Products: Product[] = [...]
  const arrayStart = content.indexOf("[");
  const arrayEnd = content.lastIndexOf("]");
  if (arrayStart === -1 || arrayEnd === -1) return [];

  const jsonSlice = content.slice(arrayStart, arrayEnd + 1);
  try {
    return JSON.parse(jsonSlice);
  } catch {
    // If not strict JSON, evaluate safely via Function
    return new Function(`return ${jsonSlice}`)();
  }
}

async function seedStorefront() {
  console.log("==================================================================");
  console.log("📦 VROOM STYLE(S) STOREFRONT SEEDING TO POSTGRESQL DATABASE");
  console.log("==================================================================");

  const clientCategoriesDir = path.resolve(__dirname, "../../../client/src/data/categories");
  const categoryFiles = [
    "fridges.ts",
    "microwaves.ts",
    "tvs.ts",
    "laptops.ts",
    "monitors.ts",
    "furniture.ts",
    "kitchenUtensils.ts",
    "cars.ts",
  ];

  let totalUpserted = 0;

  for (const file of categoryFiles) {
    const fullPath = path.join(clientCategoriesDir, file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      continue;
    }

    const items = parseProductsFromTs(fullPath);
    console.log(`\nProcessing ${file}: ${items.length} products found...`);

    for (const item of items) {
      await prisma.product.upsert({
        where: {
          id: item.id,
        },
        update: {
          externalId: item.externalId,
          name: item.name,
          description: item.description,
          price: item.price,
          originalPrice: item.originalPrice || null,
          image: item.image,
          images: item.images,
          category: item.category,
          brand: item.brand || null,
          stock: item.stock || 20,
          tag: item.tag || "Official Store",
          sizes: item.sizes || ["Standard"],
          colors: item.colors || null,
          material: item.material || "Premium Construction",
          fitGuide: item.fitGuide || "True to Size",
          specs: item.specs || null,
          isPodEligible: item.isPodEligible !== undefined ? item.isPodEligible : true,
          sellerType: item.sellerType || "1P",
          sellerName: item.sellerName || "Vroom Direct",
          sellerRating: item.sellerRating || 98,
          isActive: true,
        },
        create: {
          id: item.id,
          externalId: item.externalId,
          name: item.name,
          description: item.description,
          price: item.price,
          originalPrice: item.originalPrice || null,
          image: item.image,
          images: item.images,
          category: item.category,
          brand: item.brand || null,
          stock: item.stock || 20,
          tag: item.tag || "Official Store",
          sizes: item.sizes || ["Standard"],
          colors: item.colors || null,
          material: item.material || "Premium Construction",
          fitGuide: item.fitGuide || "True to Size",
          specs: item.specs || null,
          isPodEligible: item.isPodEligible !== undefined ? item.isPodEligible : true,
          sellerType: item.sellerType || "1P",
          sellerName: item.sellerName || "Vroom Direct",
          sellerRating: item.sellerRating || 98,
          isActive: true,
        },
      });
      totalUpserted++;
    }
    console.log(`✔ Finished seeding ${items.length} products from ${file}.`);
  }

  // Also verify total products in DB
  const finalDbCount = await prisma.product.count();
  const fridgesInDb = await prisma.product.count({
    where: { category: { contains: "Fridge", mode: "insensitive" } },
  });

  console.log("==================================================================");
  console.log(`✅ STOREFRONT SEEDING COMPLETE!`);
  console.log(`Total Products in Database: ${finalDbCount}`);
  console.log(`Total Fridges in Database: ${fridgesInDb}`);
  console.log("==================================================================");
}

seedStorefront()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
