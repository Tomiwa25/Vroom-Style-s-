import { Router } from "express";
import {
    createAdminProductController,
    getAdminOrdersController,
    getAdminStoreStatsController,
    listAdminProductsController,
    updateAdminOrderStatusController,
    updateAdminProductController,
    updateAdminStockController,
} from "../controllers/admin.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    adminEntityIdParamSchema,
    createProductSchema,
    updateOrderStatusSchema,
    updateProductSchema,
    updateStockSchema,
} from "../validators/admin.validator.js";
import { Role } from "@prisma/client";

const router = Router();

// Gateway Perimeter Guards: Authentication & Role authorization
router.use(authenticate);
router.use(authorizeRoles(Role.ADMIN));

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

router.get("/orders", getAdminOrdersController);
router.patch(
    "/orders/:id/status",
    validateRequest({ params: adminEntityIdParamSchema, body: updateOrderStatusSchema }),
    updateAdminOrderStatusController
);

router.get("/stats", getAdminStoreStatsController);
router.get("/dashboard", getAdminStoreStatsController);

export default router;
