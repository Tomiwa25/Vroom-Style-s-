import { Router } from "express";
import {
  checkoutController,
  getOrderController,
  trackOrderController,
} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
  checkoutSchema,
  trackOrderParamsSchema,
} from "../validators/order.validator.js";

const router = Router();

// Gateway Auth Perimeter: All order routes require authenticated user session
router.use(authenticate);

router.post("/", validateRequest({ body: checkoutSchema }), checkoutController);
router.get("/", getOrderController);
router.get("/:orderId/track", validateRequest({ params: trackOrderParamsSchema }), trackOrderController);

export default router;
