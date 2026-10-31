import { Router } from "express";
import {
	initializePaymentController,
	verifyPaymentController,
} from "../controllers/payment.controller.js";
import { paystackWebhookController } from "../controllers/payment.webhook.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
	initializePaymentSchema,
	verifyPaymentSchema,
} from "../validators/payment.validator.js";

const router = Router();

// Webhook endpoint (verified via HMAC signature at perimeter)
router.post("/webhook", paystackWebhookController);

// Authenticated Gateway Perimeter
router.use(authenticate);
router.post(
	"/initialize",
	validateRequest({ body: initializePaymentSchema }),
	initializePaymentController
);
router.post(
	"/verify",
	validateRequest({ body: verifyPaymentSchema }),
	verifyPaymentController
);

export default router;
