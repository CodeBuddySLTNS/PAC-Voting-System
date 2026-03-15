import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    classId: z.number().min(1, "Class ID is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

// infer types
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type SignupInput = z.infer<typeof signupSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
