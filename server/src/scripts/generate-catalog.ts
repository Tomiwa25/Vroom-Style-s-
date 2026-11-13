import dotenv from "dotenv";
dotenv.config();

import { ProductGenerationService } from "../services/product-generation.service.js";
import { CATEGORY_TEMPLATES } from "../services/catalog-generator/category-templates.js";
import prisma from "../config/database.js";

function parseArgs(): {
    count: number;
    categories?: string[];
    seed?: number;
    batchSize: number;
    includeVariations: boolean;
    cleanOnly: boolean;
    cleanBefore: boolean;
} {
    const args = process.argv.slice(2);
    let count = 1000;
    let categories: string[] | undefined;
    let seed: number | undefined;
    let batchSize = 500;
    let includeVariations = true;
    let cleanOnly = false;
    let cleanBefore = false;

    for (const arg of args) {
        if (arg.startsWith("--count=")) {
            const val = parseInt(arg.split("=")[1], 10);
            if (!isNaN(val) && val > 0) count = val;
        } else if (arg.startsWith("--categories=")) {
            const raw = arg.split("=")[1];
            categories = raw.split(",").map((c) => c.trim()).filter(Boolean);
        } else if (arg.startsWith("--seed=")) {
            const val = parseInt(arg.split("=")[1], 10);
            if (!isNaN(val)) seed = val;
        } else if (arg.startsWith("--batchSize=")) {
            const val = parseInt(arg.split("=")[1], 10);
            if (!isNaN(val) && val > 0) batchSize = val;
        } else if (arg === "--no-variations") {
            includeVariations = false;
        } else if (arg === "--only-clean" || arg === "--clean-only") {
            cleanOnly = true;
        } else if (arg === "--clean" || arg === "--clean-before") {
            cleanBefore = true;
        }
    }

    return {
        count,
        categories,
        seed,
        batchSize,
        includeVariations,
        cleanOnly,
        cleanBefore,
    };
}

async function main() {
    const opts = parseArgs();

    console.log("==================================================================");
    console.log("⚡ VROOM STYLE(S) HIGH-SCALE PRODUCT CATALOG GENERATOR & SEEDER");
    console.log("==================================================================");

    if (opts.cleanOnly || opts.cleanBefore) {
        console.log("\n🧹 Cleaning up demo products (safeguarding active orders)...");
        const cleanResult = await ProductGenerationService.deleteAllDemoProducts();
        console.log(
            `✔ Cleaned ${cleanResult.deletedCount} demo products (${cleanResult.preservedCount} preserved with orders).`
        );

        if (opts.cleanOnly) {
            console.log("\nDone! Exiting without generating new catalog.");
            await prisma.$disconnect();
            process.exit(0);
        }
    }

    const availableCategories = Object.keys(CATEGORY_TEMPLATES);
    const targetCategories = opts.categories && opts.categories.length > 0 ? opts.categories : availableCategories;

    console.log(`\n📋 Target Catalog Parameters:`);
    console.log(` - Total Products Requested: ${opts.count.toLocaleString()}`);
    console.log(` - Batch Size:               ${opts.batchSize}`);
    console.log(` - Target Categories (${targetCategories.length}): ${targetCategories.slice(0, 5).join(", ")}${targetCategories.length > 5 ? "..." : ""}`);
    console.log(` - Deterministic Seed:       ${opts.seed !== undefined ? opts.seed : "Random"}`);
    console.log(` - Include Variations:       ${opts.includeVariations}`);

    const startTime = Date.now();

    console.log("\n🚀 Commencing bulk batch generation...");

    const result = await ProductGenerationService.executeGeneration({
        count: opts.count,
        categories: targetCategories,
        seed: opts.seed,
        batchSize: opts.batchSize,
        includeVariations: opts.includeVariations,
        onProgress: (p) => {
            const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = Math.round(p.generated / (Math.max(1, Date.now() - startTime) / 1000));
            console.log(
                ` [Batch ${p.batch}] Generated: ${p.generated.toLocaleString()} / ${p.total.toLocaleString()} (${p.percentage}%) | Rate: ${rate} items/s | Elapsed: ${elapsedSec}s | Heap: ${memMB}MB`
            );
        },
    });

    const totalSeconds = (result.durationMs / 1000).toFixed(2);
    const avgRate = Math.round(result.totalGenerated / (result.durationMs / 1000));

    console.log("\n==================================================================");
    console.log("🎉 CATALOG GENERATION SUCCESSFULLY COMPLETED!");
    console.log(`✔ Job ID:             ${result.jobId}`);
    console.log(`✔ Total Generated:    ${result.totalGenerated.toLocaleString()} records`);
    console.log(`✔ Duration:           ${totalSeconds}s (${avgRate} products/sec)`);
    console.log("==================================================================");

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error("\n❌ Fatal error in catalog generation script:", error);
    await prisma.$disconnect();
    process.exit(1);
});

