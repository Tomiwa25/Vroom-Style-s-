import { Request, Response } from "express";
import {
	initializePayment,
	verifyPayment,
} from "../services/payment.service.js";

export const initializePaymentController = async (
	req: Request,
	res: Response,
) => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		const { orderId } = req.body;

		if (typeof orderId !== "string" || !orderId.trim()) {
			res.status(400).json({
				success: false,
				message: "Order ID is required",
			});
			return;
		}

		const payment = await initializePayment(orderId, req.user.userId);

		res.status(200).json({
			success: true,
			message: "Payment initialized successfully",
			data: payment,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : "Unable to initialize payment",
		});
	}
};

export const verifyPaymentController = async (
	req: Request,
	res: Response,
) => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		const { reference } = req.body;

		if (typeof reference !== "string" || !reference.trim()) {
			res.status(400).json({
				success: false,
				message: "Payment reference is required",
			});
			return;
		}

		const payment = await verifyPayment(reference, req.user.userId);

		res.status(200).json({
			success: true,
			message: "Payment verified successfully",
			data: payment,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : "Unable to verify payment",
		});
	}
};
