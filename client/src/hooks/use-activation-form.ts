import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { coleAPI } from "@/lib/utils";
import { useMainStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

export type ActivationStep = "verify-identity" | "email" | "otp";

export interface VerifiedStudentData {
  id: number;
  studentId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  department: string;
  departmentAcronym: string;
  yearLevel: string;
  email?: string;
}

const verifyIdentitySchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

const otpSchema = z.object({
  pin: z.string().min(6, "Verification code must be 6 characters."),
});

export type VerifyIdentityFormValues = z.infer<typeof verifyIdentitySchema>;
export type EmailFormValues = z.infer<typeof emailSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;

export function useActivationForm() {
  const [step, setStep] = useState<ActivationStep>("verify-identity");
  const [verifiedStudent, setVerifiedStudent] =
    useState<VerifiedStudentData | null>(null);
  const [emailForOtp, setEmailForOtp] = useState<string>("");

  const setToken = useMainStore((state) => state.setToken);
  const setUser = useMainStore((state) => state.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const identityForm = useForm<VerifyIdentityFormValues>({
    resolver: zodResolver(verifyIdentitySchema),
    defaultValues: {
      studentId: "",
      firstName: "",
      lastName: "",
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      pin: "",
    },
  });

  // verify identity mutation
  const verifyIdentityMutation = useMutation({
    mutationFn: async (data: VerifyIdentityFormValues) => {
      const fn = coleAPI("/api/auth/activate/verify-identity", "POST");
      const res = (await fn(data)) as {
        success: boolean;
        data: VerifiedStudentData;
      };
      return res.data;
    },
    onSuccess: (data) => {
      setVerifiedStudent(data);
      if (data.email) {
        emailForm.setValue("email", data.email);
      }
      setStep("email");
      toast.success("Identity verified! Please confirm your email address.");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Could not verify identity. Please check your details.",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  // send otp mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (data: { studentId: string; email: string }) => {
      const fn = coleAPI("/api/auth/activate/send-otp", "POST");
      return fn(data);
    },
    onSuccess: () => {
      setStep("otp");
      toast.success("Verification code sent to your email!");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to send verification code.",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  // verify otp mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: {
      studentId: string;
      email: string;
      otp: string;
    }) => {
      const fn = coleAPI("/api/auth/activate/verify", "POST");
      return fn(data) as Promise<{
        token: string;
        user: any;
      }>;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["student-elections"] });
      toast.success("Account activated successfully! Welcome to PAC Voting.");
      navigate("/student");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Invalid or expired verification code.",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const onSubmitIdentity = (data: VerifyIdentityFormValues) => {
    verifyIdentityMutation.mutate(data);
  };

  const onSubmitEmail = (data: EmailFormValues) => {
    if (!verifiedStudent) return;
    setEmailForOtp(data.email);
    sendOtpMutation.mutate({
      studentId: verifiedStudent.studentId,
      email: data.email,
    });
  };

  const onSubmitOtp = (data: OtpFormValues) => {
    if (!verifiedStudent) return;
    verifyOtpMutation.mutate({
      studentId: verifiedStudent.studentId,
      email: emailForOtp,
      otp: data.pin,
    });
  };

  const handleResendOtp = () => {
    if (!verifiedStudent || !emailForOtp) return;
    sendOtpMutation.mutate({
      studentId: verifiedStudent.studentId,
      email: emailForOtp,
    });
  };

  return {
    step,
    setStep,
    verifiedStudent,
    emailForOtp,
    identityForm,
    emailForm,
    otpForm,
    onSubmitIdentity,
    onSubmitEmail,
    onSubmitOtp,
    handleResendOtp,
    isLoading:
      verifyIdentityMutation.isPending ||
      sendOtpMutation.isPending ||
      verifyOtpMutation.isPending,
  };
}
