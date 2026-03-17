import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { CustomError } from "../lib/utils";
import type { LoginInput, SignupInput } from "../models/auth.models";
import { generateOtp, storeOtp, verifyOtp, clearOtp } from "../lib/utils/otp";
import { sendEmail } from "../lib/utils/email";
import status from "http-status";

const JWT_SECRET =
  process.env.ACCESS_SECRET_KEY || "default_super_secret_jwt_key";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "default_super  _refresh_key";

export const AuthService = {
  login: async (data: LoginInput) => {
    const existingUser = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      throw new CustomError("Student not found", status.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(data.password, existingUser.password);

    if (isMatch) return existingUser;

    throw new CustomError("Incorrect email or password", status.BAD_REQUEST);
  },

  loginAdmin: async (data: LoginInput) => {
    const existingUser = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      throw new CustomError("Admin not found", status.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(data.password, existingUser.password);

    if (isMatch) return existingUser;

    throw new CustomError("Incorrect email or password", status.BAD_REQUEST);
  },

  // validates input, generates otp, stores in db, sends email
  sendSignupOtp: async (data: SignupInput) => {
    const existingUser = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new CustomError("Email already registered", 409);
    }

    const otp = generateOtp();
    await storeOtp(data.email, otp, "SIGNUP", data);

    await sendEmail({
      to: data.email,
      subject: "PAC Voting System - Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 10px 16px; border-radius: 8px;">
          <h2 style="line-height: 2;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 10px; background: #f4f4f4; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #888; margin-top: 16px;">This code expires in 5 minutes.</p>
        </div>
      `,
    });

    return { email: data.email };
  },

  // verifies otp, creates student, clears otp record
  verifySignupOtp: async (email: string, otp: string) => {
    const storedData = await verifyOtp(email, otp, "SIGNUP");

    if (!storedData) {
      throw new CustomError("Invalid or expired OTP", 400);
    }

    const data = storedData as SignupInput;
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.student.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        isActive: false,
        departmentId: data.departmentId,
        yearLevelId: data.yearLevelId,
      },
    });

    await clearOtp(email, "SIGNUP");

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  },
};
