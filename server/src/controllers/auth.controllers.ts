import type { Request, Response } from "express";
import { CustomError } from "../lib/utils";
import { AuthService } from "../services/auth.services";

export const AuthController = {
  sendOtp: async (req: Request, res: Response) => {
    const result = await AuthService.sendSignupOtp(req.body);
    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      data: result,
    });
  },

  verifyOtp: async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const user = await AuthService.verifySignupOtp(email, otp);
    res.status(201).json({
      success: true,
      message: "Email verified and account created successfully",
      data: user,
    });
  },
};
