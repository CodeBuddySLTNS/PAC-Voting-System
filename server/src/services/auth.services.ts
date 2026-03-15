import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { CustomError } from "../lib/utils";
import type { LoginInput, SignupInput } from "../models/auth.models";
const JWT_SECRET =
  process.env.ACCESS_SECRET_KEY || "default_super_secret_jwt_key";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "default_super  _refresh_key";

export const AuthService = {
  signup: async (data: SignupInput) => {
    // Check if user already exists
    const existingUser = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new CustomError("Username already taken", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.student.create({
      data: {
        classId: data.classId,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  },

  // login: async (data: LoginInput) => {
  //   const user = await prisma.user.findUnique({
  //     where: { username: data.username },
  //   });

  //   if (!user) {
  //     throw new CustomError("Invalid credentials", 401);
  //   }

  //   const isMatch = await bcrypt.compare(data.password, user.password);
  //   if (!isMatch) {
  //     throw new CustomError("Invalid credentials", 401);
  //   }

  //   const payload = {
  //     id: user.id,
  //     username: user.username,
  //     role: user.role,
  //   };

  //   const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  //   const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

  //   return {
  //     user: {
  //       id: user.id,
  //       username: user.username,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       role: user.role,
  //     },
  //     accessToken,
  //     refreshToken,
  //   };
  // },

  // refresh: async (token: string) => {
  //   let decoded;
  //   try {
  //     decoded = jwt.verify(token, REFRESH_SECRET) as any;
  //   } catch (error) {
  //     throw new CustomError("Invalid refresh token", 403);
  //   }

  //   const user = await prisma.user.findUnique({
  //     where: { id: decoded.id },
  //   });

  //   if (!user) {
  //     throw new CustomError("User no longer exists", 401);
  //   }

  //   const payload = {
  //     id: user.id,
  //     username: user.username,
  //     role: user.role,
  //   };

  //   const newAccessToken = jwt.sign(payload, JWT_SECRET, {
  //     expiresIn: "15m",
  //   });
  //   return { accessToken: newAccessToken };
  // },

  // getUser: async (userId: number) => {
  //   const user = await prisma.user.findUnique({
  //     where: { id: userId },
  //   });

  //   if (!user) {
  //     throw new CustomError("User not found", 404);
  //   }

  //   return {
  //     id: user.id,
  //     username: user.username,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //   };
  // },
};
