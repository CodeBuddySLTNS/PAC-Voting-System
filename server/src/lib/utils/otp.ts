import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

type OtpType = "SIGNUP" | "ACTIVATION" | "LOGIN" | "RESET_PASSWORD";

const OTP_EXPIRY_MINUTES = 5;

// generates a 6-digit numeric otp
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// upserts an otp record with hashed code and optional json payload
export const storeOtp = async (
  email: string,
  code: string,
  type: OtpType,
  data?: object,
) => {
  const hashedOtp = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpVerification.upsert({
    where: { email_type: { email, type } },
    update: {
      otp: hashedOtp,
      data: data ? JSON.stringify(data) : null,
      expiresAt,
    },
    create: {
      email,
      type,
      otp: hashedOtp,
      data: data ? JSON.stringify(data) : null,
      expiresAt,
    },
  });
};

// verifies otp and returns parsed data if valid
export const verifyOtp = async (
  email: string,
  code: string,
  type: OtpType,
): Promise<object | null> => {
  const record = await prisma.otpVerification.findUnique({
    where: { email_type: { email, type } },
  });

  if (!record) return null;

  if (new Date() > record.expiresAt) {
    await clearOtp(email, type);
    return null;
  }

  const isMatch = await bcrypt.compare(code, record.otp);
  if (!isMatch) return null;

  return record.data ? JSON.parse(record.data) : {};
};

// removes the otp record
export const clearOtp = async (email: string, type: OtpType) => {
  await prisma.otpVerification
    .delete({ where: { email_type: { email, type } } })
    .catch(() => {}); // ignore if already deleted
};
