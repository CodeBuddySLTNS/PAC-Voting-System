import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { CustomError } from "../lib/utils";
import type {
  LoginInput,
  VerifyIdentityInput,
  SendActivationOtpInput,
  VerifyActivationOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../models/auth.models";
import { generateOtp, storeOtp, verifyOtp, clearOtp } from "../lib/utils/otp";
import { sendEmail } from "../lib/utils/email";
import status from "http-status";

export const AuthService = {
  // verifies student identity against imported masterlist
  verifyStudentIdentity: async (data: VerifyIdentityInput) => {
    const studentIdTrimmed = data.studentId.trim();
    const firstNameTrimmed = data.firstName.trim();
    const lastNameTrimmed = data.lastName.trim();

    const student = await prisma.student.findFirst({
      where: {
        studentId: studentIdTrimmed,
        firstName: { equals: firstNameTrimmed },
        lastName: { equals: lastNameTrimmed },
      },
      include: {
        department: true,
        yearLevel: true,
      },
    });

    if (!student) {
      throw new CustomError(
        "Student record not found. Please check your Student ID, First Name, and Last Name or contact your Election Officer.",
        status.NOT_FOUND,
      );
    }

    if (student.isActivated) {
      throw new CustomError(
        "This account is already activated. Please proceed to login with your Student ID and Email.",
        status.BAD_REQUEST,
      );
    }

    if (!student.isActive) {
      throw new CustomError(
        "This student account is currently deactivated. Please contact your Election Officer.",
        status.FORBIDDEN,
      );
    }

    return {
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      department: student.department.name,
      departmentAcronym: student.department.acronym,
      yearLevel: student.yearLevel.year,
      email: student.email || "",
    };
  },

  // sends otp to verify student email during activation
  sendActivationOtp: async (data: SendActivationOtpInput) => {
    const studentIdTrimmed = data.studentId.trim();
    const emailTrimmed = data.email.trim().toLowerCase();

    const student = await prisma.student.findUnique({
      where: { studentId: studentIdTrimmed },
    });

    if (!student) {
      throw new CustomError("Student record not found", status.NOT_FOUND);
    }

    if (student.isActivated) {
      throw new CustomError("Account is already activated", status.BAD_REQUEST);
    }

    // check if email is used by another student or admin
    const [existingStudent, existingAdmin] = await Promise.all([
      prisma.student.findFirst({
        where: {
          email: emailTrimmed,
          NOT: { id: student.id },
        },
      }),
      prisma.admin.findUnique({
        where: { email: emailTrimmed },
      }),
    ]);

    if (existingStudent || existingAdmin) {
      throw new CustomError(
        "This email is already registered to another account",
        status.CONFLICT,
      );
    }

    const otp = generateOtp();
    await storeOtp(emailTrimmed, otp, "ACTIVATION", {
      studentId: student.studentId,
      id: student.id,
      email: emailTrimmed,
    });

    await sendEmail({
      to: emailTrimmed,
      subject: `PAC Voting System - Activate Your Account #${Date.now()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 10px 16px; text-align: center;">
          <h2 style="margin: 3px; text-align: center;">Account Activation</h2>
          <p style="margin: 3px; text-align: center;">Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 10px; background: #f4f4f4; border-radius: 8px; margin-top: 4px">
            ${otp}
          </div>
          <p style="color: #888; margin-top: 16px; text-align: center;">This code expires in 5 minutes.</p>
          <p style="color: #888; margin-top: 16px; text-align: center;">If you did not request this code, please ignore this email.</p>
          <p style="color: #888; margin-top: 16px; text-align: center;">Archie | Criszel Mae | Kenneth | Kent PJ</p>
        </div>
      `,
    });

    return { email: emailTrimmed };
  },

  // verifies otp and activates student account
  verifyActivationOtp: async (data: VerifyActivationOtpInput) => {
    const emailTrimmed = data.email.trim().toLowerCase();
    const storedData = (await verifyOtp(
      emailTrimmed,
      data.otp,
      "ACTIVATION",
    )) as { studentId?: string; id?: number } | null;

    if (!storedData || storedData.studentId !== data.studentId.trim()) {
      throw new CustomError(
        "Invalid or expired verification code",
        status.BAD_REQUEST,
      );
    }

    const student = await prisma.student.update({
      where: { studentId: data.studentId.trim() },
      data: {
        email: emailTrimmed,
        isActivated: true,
        isActive: true,
      },
      include: {
        department: true,
        yearLevel: true,
      },
    });

    await clearOtp(emailTrimmed, "ACTIVATION");

    return {
      id: student.id,
      studentId: student.studentId,
      email: student.email!,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      isActive: student.isActive,
      isActivated: student.isActivated,
      imageUrl: student.imageUrl,
      departmentId: student.departmentId,
      yearLevelId: student.yearLevelId,
      department: student.department
        ? {
            id: student.department.id,
            name: student.department.name,
            acronym: student.department.acronym,
          }
        : undefined,
      yearLevel: student.yearLevel
        ? {
            id: student.yearLevel.id,
            year: student.yearLevel.year,
          }
        : undefined,
    };
  },

  // handles login otp request for students (passwordless) and admins (email+password)
  loginOtp: async (data: LoginInput, isAdmin?: "admin" | undefined) => {
    if (isAdmin) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: data.email.trim().toLowerCase() },
      });

      if (!existingAdmin || !data.password) {
        throw new CustomError("Incorrect email or password", status.NOT_FOUND);
      }

      const isMatch = await bcrypt.compare(
        data.password,
        existingAdmin.password,
      );
      if (!isMatch) {
        throw new CustomError("Incorrect email or password", status.BAD_REQUEST);
      }

      const otp = generateOtp();
      await storeOtp(
        existingAdmin.email,
        otp,
        "LOGIN",
        existingAdmin,
      );

      await sendEmail({
        to: existingAdmin.email,
        subject: `PAC Voting System - Admin Login OTP #${Date.now()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 10px 16px; text-align: center;">
            <h2 style="margin: 3px; text-align: center;">Admin Login Verification</h2>
            <p style="margin: 3px; text-align: center;">Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 10px; background: #f4f4f4; border-radius: 8px; margin-top: 4px">
              ${otp}
            </div>
            <p style="color: #888; margin-top: 16px; text-align: center;">This code expires in 5 minutes.</p>
            <p style="color: #888; margin-top: 16px; text-align: center;">If you did not request this code, please ignore this email.</p>
            <p style="color: #888; margin-top: 16px; text-align: center;">Archie | Criszel Mae | Kenneth | Kent PJ</p>
          </div>
        `,
      });

      return;
    }

    // student login flow (requires studentId and email)
    const emailTrimmed = data.email.trim().toLowerCase();
    const studentIdTrimmed = data.studentId?.trim();

    if (!studentIdTrimmed) {
      throw new CustomError(
        "Student ID is required for student login",
        status.BAD_REQUEST,
      );
    }

    const student = await prisma.student.findFirst({
      where: {
        studentId: studentIdTrimmed,
        email: emailTrimmed,
      },
    });

    if (!student) {
      throw new CustomError(
        "No matching student account found for this Student ID and Email",
        status.NOT_FOUND,
      );
    }

    if (!student.isActivated) {
      throw new CustomError(
        "Your account is not yet activated. Please activate your account first.",
        status.FORBIDDEN,
      );
    }

    const otp = generateOtp();
    await storeOtp(student.email!, otp, "LOGIN", {
      id: student.id,
      studentId: student.studentId,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
    });

    await sendEmail({
      to: student.email!,
      subject: `PAC Voting System - Login Verification Code #${Date.now()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 10px 16px; text-align: center;">
          <h2 style="margin: 3px; text-align: center;">Student Login Verification</h2>
          <p style="margin: 3px; text-align: center;">Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 10px; background: #f4f4f4; border-radius: 8px; margin-top: 4px">
            ${otp}
          </div>
          <p style="color: #888; margin-top: 16px; text-align: center;">This code expires in 5 minutes.</p>
          <p style="color: #888; margin-top: 16px; text-align: center;">If you did not request this code, please ignore this email.</p>
          <p style="color: #888; margin-top: 16px; text-align: center;">Archie | Criszel Mae | Kenneth | Kent PJ</p>
        </div>
      `,
    });
  },

  // verifies login otp and returns full profile
  verifyLoginOtp: async (email: string, otp: string, isAdmin?: boolean) => {
    const emailTrimmed = email.trim().toLowerCase();
    const storedData = await verifyOtp(emailTrimmed, otp, "LOGIN");

    if (!storedData) {
      throw new CustomError("Invalid or expired OTP", status.BAD_REQUEST);
    }

    await clearOtp(emailTrimmed, "LOGIN");

    const fullProfile = await AuthService.getProfile(
      emailTrimmed,
      isAdmin ? "admin" : "student",
    );

    return fullProfile || storedData;
  },

  // verifies jwt refresh token
  verifyRefreshToken: (refreshToken: string) => {
    try {
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET_KEY!,
      );
      return decodedToken;
    } catch (error) {
      throw new CustomError(
        "Invalid or expired refresh token",
        status.FORBIDDEN,
      );
    }
  },

  // gets authenticated user profile
  getProfile: async (email: string, role: "student" | "admin") => {
    const emailTrimmed = email.trim().toLowerCase();
    if (role === "student") {
      const user = await prisma.student.findUnique({
        where: { email: emailTrimmed },
        select: {
          id: true,
          studentId: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          isActive: true,
          isActivated: true,
          imageUrl: true,
          departmentId: true,
          yearLevelId: true,
          department: {
            select: {
              id: true,
              name: true,
              acronym: true,
            },
          },
          yearLevel: {
            select: {
              id: true,
              year: true,
            },
          },
        },
      });
      return user;
    }
    const user = await prisma.admin.findUnique({
      where: { email: emailTrimmed },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    return user;
  },

  // sends reset password otp for admins
  sendResetPasswordOtp: async (data: ForgotPasswordInput) => {
    const emailTrimmed = data.email.trim().toLowerCase();
    const existingUser = await prisma.admin.findUnique({
      where: { email: emailTrimmed },
    });

    if (!existingUser) {
      return { email: emailTrimmed };
    }

    const otp = generateOtp();
    await storeOtp(emailTrimmed, otp, "RESET_PASSWORD", {
      email: emailTrimmed,
      isAdmin: true,
    });

    await sendEmail({
      to: emailTrimmed,
      subject: `PAC Voting System - Reset Password Code #${Date.now()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 10px 16px; text-align: center;">
          <h2 style="margin: 3px;">Reset Password</h2>
          <p style="margin: 3px;">Your password reset verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 10px; background: #f4f4f4; border-radius: 8px; margin-top: 4px">
            ${otp}
          </div>
          <p style="color: #888; margin-top: 16px;">This code expires in 5 minutes.</p>
          <p style="color: #888; margin-top: 16px; text-align: center;">If you did not request this code, please ignore this email.</p>
          <p style="color: #888; margin-top: 16px; text-align: center;">Archie | Criszel Mae | Kenneth | Kent PJ</p>
        </div>
      `,
    });

    return { email: emailTrimmed };
  },

  // resets admin password
  resetPassword: async (data: ResetPasswordInput) => {
    const emailTrimmed = data.email.trim().toLowerCase();
    const storedData = (await verifyOtp(
      emailTrimmed,
      data.otp,
      "RESET_PASSWORD",
    )) as { email: string; isAdmin: boolean } | null;

    if (!storedData) {
      throw new CustomError("Invalid or expired OTP", status.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.admin.update({
      where: { email: emailTrimmed },
      data: { password: hashedPassword },
    });

    await clearOtp(emailTrimmed, "RESET_PASSWORD");
  },
};

