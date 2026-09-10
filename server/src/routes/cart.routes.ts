import { Router } from "express";
import {
    getCartController,
    addCartItemController,
    updateCartQuantityController,
    removeCartItemController,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getCartController);
router.post("/items", addCartItemController);
router.patch("/items/:id", updateCartQuantityController);
router.delete("/items/:id", removeCartItemController);

export default router;
