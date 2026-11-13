import { Request, Response } from "express";
import {
    createAdminProduct,
    getAdminStoreStats,
    getAllOrdersForAdmin,
    listAdminProducts,
    updateAdminOrderStatus,
    updateAdminProduct,
    updateAdminProductStock,
} from "../services/admin.service.js";
import { ProductGenerationService } from "../services/product-generation.service.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";
import { NotFoundError } from "../core/errors/app-error.js";

/**
 * HTTP Adapter Controller for Admin operations.
 * Unpacks validated admin payloads from Gateway boundary and delegates to AdminService.
 */
export const listAdminProductsController = asyncHandler(async (req: Request, res: Response) => {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 50;

    const result = await listAdminProducts(skip, take);
    return ApiResponse.success(res, result, "Admin products retrieved successfully");
});

export const createAdminProductController = asyncHandler(async (req: Request, res: Response) => {
    const product = await createAdminProduct(req.body);
    return ApiResponse.created(res, product, "Product created successfully");
});

export const updateAdminProductController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const productId = Array.isArray(rawId) ? rawId[0] : rawId;

    const product = await updateAdminProduct(productId, req.body);
    return ApiResponse.success(res, product, "Product updated successfully");
});

export const updateAdminStockController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const productId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { stock } = req.body;

    const product = await updateAdminProductStock(productId, stock);
    return ApiResponse.success(res, product, "Product stock updated successfully");
});

export const getAdminOrdersController = asyncHandler(async (req: Request, res: Response) => {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 50;

    const result = await getAllOrdersForAdmin(skip, take);
    return ApiResponse.success(res, result, "All customer orders retrieved successfully");
});

export const updateAdminOrderStatusController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const orderId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { status } = req.body;

    const order = await updateAdminOrderStatus(orderId, status);
    return ApiResponse.success(res, order, "Order status updated successfully");
});

export const getAdminStoreStatsController = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await getAdminStoreStats();
    return ApiResponse.success(res, stats, "Store telemetry retrieved successfully");
});

/**
 * Catalog Generation & Seeding Controllers
 */
export const generateCatalogController = asyncHandler(async (req: Request, res: Response) => {
    const { count = 100, categories, seed, batchSize = 500, includeVariations = true } = req.body;

    const job = await ProductGenerationService.createJob({
        totalRequested: count,
        categories,
        seed,
        includeVariations,
    });

    // Synchronous execution for small batches (<= 1000 items)
    if (count <= 1000) {
        const result = await ProductGenerationService.executeGeneration({
            jobId: job.id,
            count,
            categories,
            seed,
            batchSize,
            includeVariations,
        });

        return ApiResponse.success(res, result, `Generated ${result.totalGenerated} products successfully`);
    }

    // Asynchronous execution for high-volume batches (> 1000 items)
    ProductGenerationService.executeGeneration({
        jobId: job.id,
        count,
        categories,
        seed,
        batchSize,
        includeVariations,
    }).catch((err) => {
        console.error(`[CatalogGenerator] Background job ${job.id} failed:`, err);
    });

    return ApiResponse.success(
        res,
        {
            jobId: job.id,
            status: "RUNNING",
            totalRequested: count,
            categories: categories || [],
        },
        "Catalog generation job started in background",
        202
    );
});

export const getGenerationJobController = asyncHandler(async (req: Request, res: Response) => {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

    const job = await ProductGenerationService.getJob(jobId);
    if (!job) {
        throw new NotFoundError("Generation job not found");
    }

    return ApiResponse.success(res, job, "Job status retrieved successfully");
});

export const listGenerationJobsController = asyncHandler(async (req: Request, res: Response) => {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 20;

    const result = await ProductGenerationService.listJobs(take, skip);
    return ApiResponse.success(res, result, "Generation jobs retrieved successfully");
});

export const deleteJobDemoProductsController = asyncHandler(async (req: Request, res: Response) => {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

    const result = await ProductGenerationService.deleteJobDemoProducts(jobId);
    return ApiResponse.success(
        res,
        result,
        `Deleted ${result.deletedCount} demo products (${result.preservedCount} preserved due to active orders)`
    );
});

export const deleteAllDemoProductsController = asyncHandler(async (_req: Request, res: Response) => {
    const result = await ProductGenerationService.deleteAllDemoProducts();
    return ApiResponse.success(
        res,
        result,
        `Cleaned up ${result.deletedCount} demo products (${result.preservedCount} preserved due to active orders)`
    );
});
