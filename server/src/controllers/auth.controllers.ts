import type { Request, Response } from "express";
import { CustomError, generateTokens } from "../lib/utils";
import { AuthService } from "../services/auth.services";
import { User } from "../types/data.types";

export const AuthController = {
  loginOtp: async (req: Request, res: Response) => {
    const isAdmin = req.query?.isAdmin;

    await AuthService.loginOtp(req.body, isAdmin ? "admin" : undefined);

    res.json({
      email: req.body.email,
    });
  },

  loginVerifyOtp: async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const isAdmin = req.query?.isAdmin;

    const { password, ...user } = (await AuthService.verifyLoginOtp(
      email,
      otp,
    )) as User;

    const { refreshToken, accessToken } = generateTokens(user as User);

    res.cookie("jwt_rf", refreshToken);

    isAdmin ? (user.adminId = user.id) : (user.studentId = user.id);

    res.json({
      token: accessToken,
      user,
    });
  },

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
