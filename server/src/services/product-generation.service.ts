import prisma from "../config/database.js";
import { generateSingleProduct } from "./catalog-generator/product-generator.js";
import { invalidateProductCache } from "./product.service.js";
import { Prisma } from "@prisma/client";

export interface GenerateCatalogOptions {
    count: number;
    categories?: string[];
    seed?: number;
    batchSize?: number;
    includeVariations?: boolean;
    jobId?: string;
    onProgress?: (progress: { generated: number; total: number; batch: number; percentage: number }) => void;
}

export interface JobSummary {
    id: string;
    status: string;
    totalRequested: number;
    totalGenerated: number;
    totalFailed: number;
    categories: string[];
    seed: number | null;
    includeVariations: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class ProductGenerationService {
    private static DEFAULT_BATCH_SIZE = 500;

    /**
     * Creates a new generation job record in the database.
     */
    static async createJob(options: {
        totalRequested: number;
        categories?: string[];
        seed?: number;
        includeVariations?: boolean;
    }): Promise<JobSummary> {
        const job = await prisma.productGenerationJob.create({
            data: {
                totalRequested: options.totalRequested,
                categories: options.categories || [],
                seed: options.seed ?? null,
                includeVariations: options.includeVariations ?? true,
                status: "PENDING",
            },
        });

        return job;
    }

    /**
     * Executes catalog generation in memory-efficient batches.
     */
    static async executeGeneration(options: GenerateCatalogOptions): Promise<{
        jobId: string;
        totalRequested: number;
        totalGenerated: number;
        durationMs: number;
    }> {
        const startTime = Date.now();
        const {
            count,
            categories,
            seed,
            batchSize = ProductGenerationService.DEFAULT_BATCH_SIZE,
            includeVariations = true,
            onProgress,
        } = options;

        let jobId = options.jobId;

        // Ensure job record exists
        if (!jobId) {
            const created = await this.createJob({
                totalRequested: count,
                categories,
                seed,
                includeVariations,
            });
            jobId = created.id;
        }

        await prisma.productGenerationJob.update({
            where: { id: jobId },
            data: { status: "RUNNING" },
        });

        let totalGenerated = 0;
        let totalFailed = 0;
        const totalBatches = Math.ceil(count / batchSize);

        try {
            for (let b = 0; b < totalBatches; b++) {
                const currentBatchStart = b * batchSize;
                const currentBatchCount = Math.min(batchSize, count - currentBatchStart);
                const batchData: Prisma.ProductCreateManyInput[] = [];

                for (let i = 0; i < currentBatchCount; i++) {
                    const globalIndex = currentBatchStart + i;
                    const selectedCategory =
                        categories && categories.length > 0
                            ? categories[globalIndex % categories.length]
                            : undefined;

                    const record = generateSingleProduct({
                        index: globalIndex,
                        category: selectedCategory,
                        jobId,
                        seed,
                        includeVariations,
                    });

                    batchData.push(record);
                }

                // High-performance bulk insertion with duplicate skipping
                const result = await prisma.product.createMany({
                    data: batchData,
                    skipDuplicates: true,
                });

                totalGenerated += result.count;
                const failedInBatch = currentBatchCount - result.count;
                if (failedInBatch > 0) {
                    totalFailed += failedInBatch;
                }

                // Update job progress in DB periodically
                await prisma.productGenerationJob.update({
                    where: { id: jobId },
                    data: {
                        totalGenerated,
                        totalFailed,
                    },
                });

                if (onProgress) {
                    onProgress({
                        generated: totalGenerated,
                        total: count,
                        batch: b + 1,
                        percentage: Math.min(100, Math.round((totalGenerated / count) * 100)),
                    });
                }
            }

            // Mark job as completed
            await prisma.productGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: "COMPLETED",
                    totalGenerated,
                    totalFailed,
                },
            });

            // Invalidate redis/memory cache so new products appear instantly on storefront
            await invalidateProductCache();

            const durationMs = Date.now() - startTime;
            return {
                jobId,
                totalRequested: count,
                totalGenerated,
                durationMs,
            };
        } catch (error: any) {
            // Update job status to FAILED
            await prisma.productGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: "FAILED",
                    totalGenerated,
                    totalFailed,
                    errorDetails: {
                        message: error?.message || "Unknown error during catalog generation",
                        stack: error?.stack,
                    },
                },
            });

            // Even on failure, flush cache for any successfully inserted items
            await invalidateProductCache();
            throw error;
        }
    }

    /**
     * Retrieves job status and metadata.
     */
    static async getJob(jobId: string) {
        return prisma.productGenerationJob.findUnique({
            where: { id: jobId },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
    }

    /**
     * Lists recent generation jobs.
     */
    static async listJobs(limit = 20, skip = 0) {
        const [jobs, total] = await Promise.all([
            prisma.productGenerationJob.findMany({
                orderBy: { createdAt: "desc" },
                take: limit,
                skip,
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
            }),
            prisma.productGenerationJob.count(),
        ]);

        return { jobs, total, limit, skip };
    }

    /**
     * Safely deletes demo products generated by a specific job.
     * Prevents deleting products that have customer orders.
     */
    static async deleteJobDemoProducts(jobId: string): Promise<{
        deletedCount: number;
        preservedCount: number;
    }> {
        // Find products with orders to protect customer history
        const orderedProductIds = await prisma.orderItem.findMany({
            where: {
                product: {
                    jobId,
                    isDemo: true,
                },
            },
            select: { productId: true },
        });

        const preservedIds = Array.from(new Set(orderedProductIds.map((item) => item.productId)));

        // If products have orders, deactivate them instead of hard deleting
        if (preservedIds.length > 0) {
            await prisma.product.updateMany({
                where: {
                    id: { in: preservedIds },
                },
                data: {
                    isActive: false,
                },
            });
        }

        // Delete remaining products without order relations
        const deleteResult = await prisma.product.deleteMany({
            where: {
                jobId,
                isDemo: true,
                id: { notIn: preservedIds },
            },
        });

        // Update the job status
        await prisma.productGenerationJob.update({
            where: { id: jobId },
            data: {
                status: "DELETED",
            },
        });

        await invalidateProductCache();

        return {
            deletedCount: deleteResult.count,
            preservedCount: preservedIds.length,
        };
    }

    /**
     * Safely cleans up all demo products from the catalog.
     * Real seller products (isDemo: false) and products with order history are strictly preserved.
     */
    static async deleteAllDemoProducts(): Promise<{
        deletedCount: number;
        preservedCount: number;
    }> {
        // Protect products attached to existing orders
        const orderedProductIds = await prisma.orderItem.findMany({
            where: {
                product: {
                    isDemo: true,
                },
            },
            select: { productId: true },
        });

        const preservedIds = Array.from(new Set(orderedProductIds.map((item) => item.productId)));

        if (preservedIds.length > 0) {
            await prisma.product.updateMany({
                where: {
                    id: { in: preservedIds },
                    isDemo: true,
                },
                data: {
                    isActive: false,
                },
            });
        }

        // Delete demo items without order records
        const deleteResult = await prisma.product.deleteMany({
            where: {
                isDemo: true,
                id: { notIn: preservedIds },
            },
        });

        await invalidateProductCache();

        return {
            deletedCount: deleteResult.count,
            preservedCount: preservedIds.length,
        };
    }
}
