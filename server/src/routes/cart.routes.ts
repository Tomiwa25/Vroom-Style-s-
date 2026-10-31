import { Router } from "express";
import {
    addCartItemController,
    getCartController,
    removeCartItemController,
    updateCartQuantityController,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
    addCartItemSchema,
    updateCartQuantitySchema,
    cartItemIdParamSchema,
} from "../validators/cart.validator.js";

const router = Router();

// Gateway Auth Perimeter: All cart endpoints require user authentication
router.use(authenticate);

router.get("/", getCartController);
router.post(
    "/items",
    validateRequest({ body: addCartItemSchema }),
    addCartItemController
);
router.patch(
    "/items/:id",
    validateRequest({ params: cartItemIdParamSchema, body: updateCartQuantitySchema }),
    updateCartQuantityController
);
router.delete(
    "/items/:id",
    validateRequest({ params: cartItemIdParamSchema }),
    removeCartItemController
);

export default router;
