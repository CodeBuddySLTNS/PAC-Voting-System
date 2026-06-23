import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { coleAPI } from "@/lib/utils";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

const requestSchema = z.object({
  email: z.string().min(1, "email is required").email("invalid email"),
});

const resetSchema = z.object({
  otp: z.string().length(6, "otp must be 6 digits"),
  password: z.string().min(6, "password must be at least 6 characters long"),
});

type RequestFormValues = z.infer<typeof requestSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [role, setRole] = useState<"student" | "officer">("student");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [emailForReset, setEmailForReset] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", password: "" },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: RequestFormValues) => {
      return await coleAPI("/api/auth/forgot-password", "POST")({
        email: data.email,
        isAdmin: role === "officer",
      });
    },
    onSuccess: (_, variables) => {
      setEmailForReset(variables.email);
      setStep("reset");
      toast.success("reset code sent to your email");
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "failed to request reset code");
      } else {
        toast.error("an unexpected error occurred");
      }
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetFormValues) => {
      return await coleAPI("/api/auth/reset-password", "POST")({
        email: emailForReset,
        otp: data.otp,
        password: data.password,
      });
    },
    onSuccess: () => {
      toast.success("password reset successfully");
      navigate("/login");
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "failed to reset password");
      } else {
        toast.error("an unexpected error occurred");
      }
    },
  });

  const onSubmitRequest = (data: RequestFormValues) => {
    requestMutation.mutate(data);
  };

  const onSubmitReset = (data: ResetFormValues) => {
    resetMutation.mutate(data);
  };

  const isLoading = requestMutation.isPending || resetMutation.isPending;

  return (
    <AuthLayout
      title="Reset password"
      subtitle={
        step === "request"
          ? "enter your email address to receive a verification code"
          : "enter the 6-digit code and choose a new password"
      }
    >
      <Card className="border-0 p-5 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardContent className="p-0">
          {step === "request" ? (
            <Tabs
              defaultValue="student"
              value={role}
              onValueChange={(v) => {
                setRole(v as "student" | "officer");
                requestForm.reset();
              }}
              className="w-full"
            >
              <TabsList className="mb-4 grid h-10 w-full grid-cols-2 px-1 py-1">
                <TabsTrigger value="student" className="h-8">
                  Student
                </TabsTrigger>
                <TabsTrigger value="officer" className="h-8">
                  Election Officer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form
                  onSubmit={requestForm.handleSubmit(onSubmitRequest)}
                  className="space-y-4"
                >
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        placeholder="juantamad@gmail.com"
                        {...requestForm.register("email")}
                        data-invalid={!!requestForm.formState.errors.email}
                      />
                      <FieldError errors={[requestForm.formState.errors.email]} />
                    </Field>
                  </FieldGroup>

                  <Button
                    type="submit"
                    className="w-full cursor-pointer hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send code"}
                  </Button>

                  <div className="mt-2 text-center text-sm">
                    <Link
                      to="/login"
                      className="inline-flex items-center font-medium text-primary underline-offset-4 hover:underline"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="officer">
                <form
                  onSubmit={requestForm.handleSubmit(onSubmitRequest)}
                  className="space-y-4"
                >
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="officer-email">Email</FieldLabel>
                      <Input
                        id="officer-email"
                        placeholder="juantamad@gmail.com"
                        {...requestForm.register("email")}
                        data-invalid={!!requestForm.formState.errors.email}
                      />
                      <FieldError errors={[requestForm.formState.errors.email]} />
                    </Field>
                  </FieldGroup>

                  <Button
                    type="submit"
                    className="w-full cursor-pointer hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send code"}
                  </Button>

                  <div className="mt-2 text-center text-sm">
                    <Link
                      to="/login"
                      className="inline-flex items-center font-medium text-primary underline-offset-4 hover:underline"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="text-sm text-muted-foreground">
                  we've sent a 6-digit code to
                  <br />
                  <span className="font-medium text-foreground">{emailForReset}</span>
                </p>
              </div>

              <FieldGroup className="space-y-4">
                <Field className="flex flex-col items-center justify-center text-center">
                  <FieldLabel htmlFor="pin" className="mb-2 self-start">Verification Code</FieldLabel>
                  <Controller
                    control={resetForm.control}
                    name="otp"
                    render={({ field }) => (
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className="mx-auto w-max">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  />
                  <FieldError errors={[resetForm.formState.errors.otp]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...resetForm.register("password")}
                      data-invalid={!!resetForm.formState.errors.password}
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 flex h-full items-center justify-center rounded-r-md px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "hide password" : "show password"}
                      </span>
                    </button>
                  </div>
                  <FieldError errors={[resetForm.formState.errors.password]} />
                </Field>
              </FieldGroup>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => setStep("request")}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
