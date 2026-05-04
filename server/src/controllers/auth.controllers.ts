import type { Request, Response } from "express";
import { CustomError, generateTokens } from "../lib/utils";
import { AuthService } from "../services/auth.services";
import { User } from "../types/data.types";
import status from "http-status";

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

    isAdmin ? (user.adminId = user.id) : (user.studentId = user.id);

    const { refreshToken, accessToken } = generateTokens(user as User);

    res.cookie("jwt_rf", refreshToken);

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
    const user = (await AuthService.verifySignupOtp(
      email,
      otp,
    )) as unknown as User;

    user.studentId = user.id;

    const { refreshToken, accessToken } = generateTokens(user as User);

    res.cookie("jwt_rf", refreshToken);

    res.status(201).json({
      success: true,
      message: "Email verified and account created successfully",
      token: accessToken,
      user,
    });
  },

  refreshToken: async (req: Request, res: Response) => {
    const isAdmin = req.query?.isAdmin;
    const refreshToken = req.cookies.jwt_rf;
    if (!refreshToken)
      throw new CustomError("No refresh token", status.UNAUTHORIZED);

    const user = AuthService.verifyRefreshToken(refreshToken) as User;

    const { accessToken } = generateTokens(user);

    res.json({ accessToken });
  },

  getProfile: async (req: Request, res: Response) => {
    const user = res.locals.user as User;
    const profile = await AuthService.getProfile(
      user.email,
      user.adminId ? "admin" : "student",
    );

    res.status(200).json({
      success: true,
      user: { ...profile, adminId: user.adminId, studentId: user.studentId },
    });
  },

  logout: async (req: Request, res: Response) => {
    res.clearCookie("jwt_rf", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  },
};
