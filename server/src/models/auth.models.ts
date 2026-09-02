import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    studentId: z.string().optional(),
    password: z.string().optional(),
  }),
});

export const verifyIdentitySchema = z.object({
  body: z.object({
    studentId: z.string().min(1, "Student ID is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  }),
});

export const sendActivationOtpSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, "Student ID is required"),
    email: z.string().email("Invalid email address"),
  }),
});

export const verifyActivationOtpSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, "Student ID is required"),
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, "Student ID is required"),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    departmentId: z.number().min(1, "Department ID is required"),
    yearLevelId: z.number().min(1, "Year Level ID is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    isAdmin: z.boolean().optional(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

// infer types
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyIdentityInput = z.infer<typeof verifyIdentitySchema>["body"];
export type SendActivationOtpInput = z.infer<typeof sendActivationOtpSchema>["body"];
export type VerifyActivationOtpInput = z.infer<typeof verifyActivationOtpSchema>["body"];
export type SignupInput = z.infer<typeof signupSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
