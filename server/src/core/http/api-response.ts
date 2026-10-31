import type { Response } from "express";

export class ApiResponse {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode = 200
  ): Response {
    const payload: { success: boolean; message?: string; data?: T } = {
      success: true,
    };
    if (message !== undefined) {
      payload.message = message;
    }
    if (data !== undefined) {
      payload.data = data;
    }
    return res.status(statusCode).json(payload);
  }

  static created<T>(
    res: Response,
    data?: T,
    message?: string
  ): Response {
    return ApiResponse.success(res, data, message, 201);
  }
}
