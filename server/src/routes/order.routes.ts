import { Router } from "express";
import { checkoutController, getOrderController, trackOrderController } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/", checkoutController);
router.get("/", getOrderController);
router.get("/:orderId/track", trackOrderController);

export default router;

