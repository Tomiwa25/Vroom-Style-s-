import { Request, Response } from "express";
import { checkout, getOrderTracking, getUserOrders } from "../services/order.service.js";


export const checkoutController = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		const order = await checkout(req.user.userId, req.body?.items);

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

export const trackOrderController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const rawOrderId = req.params.orderId;
        const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

        if (!orderId) {
            res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
            return;
        }

        const isAdmin = req.user.role === "ADMIN";
        const tracking = await getOrderTracking(orderId, req.user.userId, isAdmin);

        res.status(200).json({
            success: true,
            message: "Order tracking details retrieved",
            data: tracking,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Unable to retrieve tracking",
        });
    }
};