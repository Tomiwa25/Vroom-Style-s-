import { Router } from "express";
import {
    getProductsController,
    getProductByIdController,
    searchProductsController,
} from "../controllers/product.controller.js";
import { searchLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.get("/search", searchLimiter, searchProductsController);
router.get("/", getProductsController);
router.get("/:id", getProductByIdController);

export default router;