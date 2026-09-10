import { Router } from "express";
import {
	initializePaymentController,
	verifyPaymentController,
} from "../controllers/payment.controller.js";
import { paystackWebhookController } from "../controllers/payment.webhook.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/webhook", paystackWebhookController);
router.use(authenticate);
router.post("/initialize", initializePaymentController);
router.post("/verify", verifyPaymentController);

export default router;
