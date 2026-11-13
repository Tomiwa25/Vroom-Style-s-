import { Router } from "express";
import {
    createAdminProductController,
    deleteAllDemoProductsController,
    deleteJobDemoProductsController,
    generateCatalogController,
    getAdminOrdersController,
    getAdminStoreStatsController,
    getGenerationJobController,
    listAdminProductsController,
    listGenerationJobsController,
    updateAdminOrderStatusController,
    updateAdminProductController,
    updateAdminStockController,
} from "../controllers/admin.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    adminEntityIdParamSchema,
    adminJobIdParamSchema,
    adminJobsQuerySchema,
    adminOrdersQuerySchema,
    createProductSchema,
    generateCatalogSchema,
    updateOrderStatusSchema,
    updateProductSchema,
    updateStockSchema,
} from "../validators/admin.validator.js";
import { Role } from "@prisma/client";

const router = Router();

// Gateway Perimeter Guards: Authentication & Role authorization
router.use(authenticate);
router.use(authorizeRoles(Role.ADMIN));

// Product Catalog & Generation routes
router.get("/products", listAdminProductsController);
router.post(
    "/products",
    validateRequest({ body: createProductSchema }),
    createAdminProductController
);
router.put(
    "/products/:id",
    validateRequest({ params: adminEntityIdParamSchema, body: updateProductSchema }),
    updateAdminProductController
);
router.patch(
    "/products/:id/stock",
    validateRequest({ params: adminEntityIdParamSchema, body: updateStockSchema }),
    updateAdminStockController
);

// High-Scale Catalog Seeding & Job Management
router.post(
    "/products/generate",
    validateRequest({ body: generateCatalogSchema }),
    generateCatalogController
);
router.get(
    "/products/generation-jobs",
    validateRequest({ query: adminJobsQuerySchema }),
    listGenerationJobsController
);
router.get(
    "/products/generation-jobs/:jobId",
    validateRequest({ params: adminJobIdParamSchema }),
    getGenerationJobController
);
router.delete(
    "/products/generation-jobs/:jobId/products",
    validateRequest({ params: adminJobIdParamSchema }),
    deleteJobDemoProductsController
);
router.delete(
    "/products/demo-clean",
    deleteAllDemoProductsController
);

// Order Management routes
router.get(
    "/orders",
    validateRequest({ query: adminOrdersQuerySchema }),
    getAdminOrdersController
);
router.patch(
    "/orders/:id/status",
    validateRequest({ params: adminEntityIdParamSchema, body: updateOrderStatusSchema }),
    updateAdminOrderStatusController
);

// Telemetry & Dashboard routes
router.get("/stats", getAdminStoreStatsController);
router.get("/dashboard", getAdminStoreStatsController);

export default router;
