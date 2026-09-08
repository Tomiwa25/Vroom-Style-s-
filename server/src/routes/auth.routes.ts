import { Router } from "express";
import {
    registerController,
    loginController,
    getCurrentUserController
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/currentUser", authenticate, getCurrentUserController);

export default router;