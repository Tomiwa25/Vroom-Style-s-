import dotenv from "dotenv";
import prisma from "../config/database.js";
import { seedDatabase } from "./seed.js";
import { fetchPlatziFashionCatalog } from "../services/external/platzi.service.js";

dotenv.config();

export const runFullCatalogIngestion = async () => {
  console.log("==================================================================");
  console.log("🚀 VROOM STYLE(S) TRI-TIER CATALOG INGESTION & BLENDING PIPELINE");
  console.log("==================================================================");

  try {
    // 1. Seed baseline 12 signature atelier pieces with high-res Unsplash CDN
    console.log("\n[Step 1/2] Seeding signature atelier collection...");
    await seedDatabase();

    // 2. Fetch and blend live apparel from Platzi Fashion API
    console.log("\n[Step 2/2] Ingesting & blending live Platzi apparel (Naira pricing & deduplicated images)...");
    const platziProducts = await fetchPlatziFashionCatalog(50);
    console.log(`Fetched ${platziProducts.length} verified apparel items from Platzi API.`);

    let importedCount = 0;

    for (const item of platziProducts) {
      await prisma.product.upsert({
        where: {
          externalId: item.externalId,
        },
        update: {
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          images: item.images,
          category: item.category,
          stock: item.stock,
          tag: item.tag,
          sizes: item.sizes,
          colors: item.colors,
          material: item.material,
          fitGuide: item.fitGuide,
          isActive: true,
        },
        create: {
          externalId: item.externalId,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          images: item.images,
          category: item.category,
          stock: item.stock,
          tag: item.tag,
          sizes: item.sizes,
          colors: item.colors,
          material: item.material,
          fitGuide: item.fitGuide,
          isActive: true,
        },
      });
      importedCount++;
    }

    const totalInDb = await prisma.product.count({ where: { isActive: true } });

    console.log("\n==================================================================");
    console.log(`🎉 Pipeline complete!`);
    console.log(`• Signature Atelier Pieces: 12`);
    console.log(`• Ingested Platzi Fashion Items: ${importedCount}`);
    console.log(`• Total Active Catalog in PostgreSQL: ${totalInDb} products`);
    console.log("==================================================================");
  } catch (error) {
    console.error("❌ Catalog ingestion pipeline failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

// Execute if run directly via CLI
if (process.argv[1] && process.argv[1].endsWith("import-products.ts")) {
  runFullCatalogIngestion();
}