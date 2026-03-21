import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useMainStore } from "@/store";

export const signupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name is required"),
  departmentId: z.number().min(1, "Department is required"),
  yearLevelId: z.number().min(1, "Year Level is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyOtpSchema = z.object({
  pin: z.string().length(6, "Verification code must be 6 digits"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

export function useSignupForm() {
  const navigate = useNavigate();
  const setToken = useMainStore((state) => state.setToken);
  const setUser = useMainStore((state) => state.setUser);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [emailForOtp, setEmailForOtp] = useState("");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      departmentId: 0,
      yearLevelId: 0,
      email: "",
      password: "",
    },
  });

  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      pin: "",
    },
  });

  const sendOtpMutation = useMutation<unknown, Error, SignupFormValues>({
    mutationFn: coleAPI("/api/auth/signup/send-otp", "POST"),
    onSuccess: (_, variables) => {
      setEmailForOtp(variables.email);
      setStep("otp");
      toast.success("Verification code sent to your email");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
      } else {
        toast.error("Failed to send OTP");
      }
    },
  });

  const verifyOtpMutation = useMutation<
    any,
    Error,
    { email: string; otp: string }
  >({
    mutationFn: coleAPI("/api/auth/signup/verify", "POST"),
    onSuccess: (res: any) => {
      setToken(res.token);
      setUser(res.user);
      toast.success("Account created successfully!");
      navigate("/", { replace: true });
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Invalid verification code"
        );
      } else {
        toast.error("Invalid verification code");
      }
    },
  });

  const onSubmitSignup = (data: SignupFormValues) => {
    sendOtpMutation.mutate(data);
  };

  const onSubmitOtp = (data: VerifyOtpFormValues) => {
    verifyOtpMutation.mutate({
      email: emailForOtp,
      otp: data.pin,
    });
  };

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return {
    form,
    otpForm,
    step,
    setStep,
    isLoading,
    emailForOtp,
    onSubmitSignup,
    onSubmitOtp,
  };
}
