import { Router } from "express";
import {
    getProductsController,
    getProductByIdController,
    searchProductsController,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/search", searchProductsController);
router.get("/", getProductsController);
router.get("/:id", getProductByIdController);

export default router;