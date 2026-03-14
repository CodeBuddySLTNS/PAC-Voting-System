import type { Request, Response } from "express";
import { CustomError } from "../lib/utils";
import { AuthService } from "../services/auth.services";

export const AuthController = {
  signup: async (req: Request, res: Response) => {
    const user = await AuthService.signup(req.body);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: user,
    });
  },

  // login: async (req: Request, res: Response) => {
  //   const result = await AuthService.login(req.body);

  //   // Set refresh token in HTTP-only cookie
  //   res.cookie("jwt_rf", result.refreshToken, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "strict",
  //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  //   });

  //   // Send access token and user info in payload
  //   res.status(200).json({
  //     success: true,
  //     message: "Logged in successfully",
  //     accessToken: result.accessToken,
  //     user: result.user,
  //   });
  // },

  // refreshToken: async (req: Request, res: Response) => {
  //   // Access token usually expired when this is called, use cookie
  //   const refreshToken = req.cookies?.jwt_rf;

  //   if (!refreshToken) {
  //     throw new CustomError("No refresh token provided", 401);
  //   }

  //   const result = await AuthService.refresh(refreshToken);
  //   res.status(200).json({
  //     success: true,
  //     accessToken: result.accessToken,
  //   });
  // },

  // logout: async (req: Request, res: Response) => {
  //   res.clearCookie("jwt_rf", {
  //     httpOnly: true,
  //     secure: false,
  //     sameSite: "strict",
  //   });

  //   res.status(200).json({ success: true, message: "Logged out successfully" });
  // },

  // me: async (req: Request, res: Response) => {
  //   const userId = res.locals.user.id;
  //   if (!userId) {
  //     throw new CustomError("User not authenticated", 401);
  //   }

  //   const user = await AuthService.getUser(userId);

  //   res.status(200).json({
  //     success: true,
  //     user,
  //   });
  // },
};
