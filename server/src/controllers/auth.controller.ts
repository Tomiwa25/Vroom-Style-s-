import { Request, Response} from "express";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validators/auth.validator";

export const registerController = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const user = await registerUser(validatedData);
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: user,
        });
    } catch (error) {
        if (error instanceof  Error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Account registration failed"
        });
    }
};

export const loginController = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const result = await loginUser(validatedData.email, validatedData.password);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        if (error instanceof  Error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

export const getCurrentUserController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
           res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return; 
        }
        const user = await getCurrentUser(req.user.userId);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
};