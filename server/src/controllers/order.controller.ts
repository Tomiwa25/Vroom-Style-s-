import { Request, Response } from "express";
import { checkout, getUserOrders } from "../services/order.service.js";

export const checkoutController = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		const order = await checkout(req.user.userId);

		res.status(201).json({
			success: true,
			message: "Order created successfully",
			data: order,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : "Unable to create order",
		});
	}
};
 export const getOrderController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}
        const orders = await getUserOrders(req.user.userId);

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Failed to get orders:", error);
        res.status(500).json({
            success: false,
            message: "Unable to get orders"
        });
    }
 };