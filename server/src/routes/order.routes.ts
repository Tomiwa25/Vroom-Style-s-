import { Router } from "express";
import { checkoutController, getOrderController} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/", checkoutController);
router.get("/", getOrderController)

export default router;
