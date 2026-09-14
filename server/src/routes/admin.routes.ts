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
import { Role } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(Role.ADMIN));

router.get("/products", listAdminProductsController);
router.post("/products", createAdminProductController);
router.put("/products/:id", updateAdminProductController);
router.patch("/products/:id/stock", updateAdminStockController);

router.get("/orders", getAdminOrdersController);
router.patch("/orders/:id/status", updateAdminOrderStatusController);

router.get("/stats", getAdminStoreStatsController);
router.get("/dashboard", getAdminStoreStatsController);

export default router;
