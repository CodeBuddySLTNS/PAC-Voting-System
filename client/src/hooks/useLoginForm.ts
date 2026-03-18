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

export type LoginRole = "student" | "officer";
export type LoginStep = "credentials" | "otp";

const studentSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const officerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  pin: z.string().min(6, "Your one-time password must be 6 characters."),
});

export type StudentLoginFormValues = z.infer<typeof studentSchema>;
export type OfficerLoginFormValues = z.infer<typeof officerSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;

type LoginData = {
  data: { email: string; password: string };
  isAdmin: boolean;
};

export function useLoginForm() {
  const [role, setRole] = useState<LoginRole>("student");
  const [step, setStep] = useState<LoginStep>("credentials");
  const [emailForOtp, setEmailForOtp] = useState<string>("");

  const setToken = useMainStore((state) => state.setToken);
  const setUser = useMainStore((state) => state.setUser);
  const navigate = useNavigate();

  const studentForm = useForm<StudentLoginFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const officerForm = useForm<OfficerLoginFormValues>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      pin: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ data, isAdmin }: LoginData) => {
      const endpoint = isAdmin
        ? "/api/auth/login?isAdmin=true"
        : "/api/auth/login";
      return await coleAPI(endpoint, "POST")(data);
    },
    onSuccess: (res, variables) => {
      setEmailForOtp(res.email || variables.data.email);
      setStep("otp");
      toast.success("Verification code sent to your email");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message || "Login Failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: coleAPI(
      role === "officer"
        ? "/api/auth/login/verify?isAdmin=true"
        : "/api/auth/login/verify",
      "POST"
    ),
    onSuccess: (res) => {
      setToken(res.token);
      setUser(res.user);
      toast.success("Login successful");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          toast.error("Unable to connect to the server");
        } else {
          toast.error(
            error?.response?.data?.message || "An unexpected error occurred"
          );
        }
      }
    },
  });

  const handleCredentialsSubmit = (
    data: { email: string; password: string },
    isAdmin: boolean
  ) => {
    loginMutation.mutate({ data, isAdmin });
  };

  const onSubmitStudent = (data: StudentLoginFormValues) =>
    handleCredentialsSubmit(data, false);
  const onSubmitOfficer = (data: OfficerLoginFormValues) =>
    handleCredentialsSubmit(data, true);

  const onVerifyOtp = (data: OtpFormValues) => {
    verifyOtpMutation.mutate({ email: emailForOtp, otp: data.pin });
  };

  const isLoading = loginMutation.isPending || verifyOtpMutation.isPending;

  return {
    role,
    setRole,
    step,
    setStep,
    isLoading,
    studentForm,
    officerForm,
    otpForm,
    onSubmitStudent,
    onSubmitOfficer,
    onVerifyOtp,
    emailForOtp,
  };
}
