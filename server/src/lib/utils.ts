import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import { User } from "../types/data.types";

const ACCESS_SECRET = process.env.ACCESS_SECRET_KEY || "";
const REFRESH_SECRET = process.env.REFRESH_SECRET_KEY || "";
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export const tryCatch =
  (handler: (req: Request, res: Response) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };

export const generateReferenceNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `REF-${timestamp}-${random}`;
};

export const generateTokens = (user: User) => {
  const payload = {
    id: user.id,
    email: user.email,
    studentId: user.studentId ?? null,
    adminId: user.adminId ?? null,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });

  return { accessToken, refreshToken };
};

export class CustomError extends Error {
  errorCode: string | null;
  statusCode: number;
  body: object | null;

  constructor(
    message: string,
    statusCode: number,
    body?: object,
    errorCode?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.body = body || null;
    this.errorCode = errorCode || null;
  }
}

// const envSchema = z.object({
//   NODE_ENV: z.string(),
//   DB_USER: z.string(),
//   DB_PASSWORD: z.string(),
//   DB_HOST: z.string(),
//   DB_PORT: z.string().optional(),
//   DB_DBNAME: z.string(),
//   ACCESS_SECRET_KEY: z.string(),
//   REFRESH_SECRET_KEY: z.string(),
// });

// export const env = envSchema.parse(process.env);
