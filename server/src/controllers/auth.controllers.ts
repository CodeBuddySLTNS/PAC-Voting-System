import type { Request, Response } from "express";
import { CustomError, generateTokens } from "../lib/utils";
import { AuthService } from "../services/auth.services";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { password, ...student } = await AuthService.login(req.body);

    const { refreshToken, accessToken } = generateTokens(student);

    res.cookie("jwt_rf", refreshToken);

    res.json({
      token: accessToken,
      user: student,
    });
  },

  loginAdmin: async (req: Request, res: Response) => {
    const { password, ...student } = await AuthService.loginAdmin(req.body);

    const { refreshToken, accessToken } = generateTokens(student);

    res.cookie("jwt_rf", refreshToken);

    res.json({
      token: accessToken,
      user: student,
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
