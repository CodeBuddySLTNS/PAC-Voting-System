import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, Mail, UserCheck } from "lucide-react";
import { useActivationForm } from "@/hooks/use-activation-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Controller } from "react-hook-form";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Badge } from "@/components/ui/badge";

export default function ActivatePage() {
  const {
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
    isLoading,
  } = useActivationForm();

  return (
    <AuthLayout
      title="Activate Voter Account"
      subtitle="Verify your student information to claim your pre-approved voting account"
    >
      <Card className="border-0 p-5 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardContent className="p-0">
          {/* STEP 1: Verify Identity */}
          {step === "verify-identity" && (
            <form
              onSubmit={identityForm.handleSubmit(onSubmitIdentity)}
              className="space-y-4"
            >
              <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Please enter your official details as recorded in the campus
                  masterlist.
                </span>
              </div>

              <FieldGroup className="space-y-3.5">
                <Field>
                  <FieldLabel htmlFor="studentId">Student ID Number</FieldLabel>
                  <Input
                    id="studentId"
                    placeholder="e.g. 2023-00123"
                    {...identityForm.register("studentId")}
                    data-invalid={!!identityForm.formState.errors.studentId}
                  />
                  <FieldError
                    errors={[identityForm.formState.errors.studentId]}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      {...identityForm.register("firstName")}
                      data-invalid={!!identityForm.formState.errors.firstName}
                    />
                    <FieldError
                      errors={[identityForm.formState.errors.firstName]}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      {...identityForm.register("lastName")}
                      data-invalid={!!identityForm.formState.errors.lastName}
                    />
                    <FieldError
                      errors={[identityForm.formState.errors.lastName]}
                    />
                  </Field>
                </div>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full mt-2 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Checking Masterlist..." : "Verify My Identity"}
              </Button>

              <div className="text-center text-sm pt-2">
                <p className="text-muted-foreground">
                  Already activated your account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:underline underline-offset-4"
                  >
                    Log in here
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: Confirm Profile & Input Email */}
          {step === "email" && verifiedStudent && (
            <form
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              className="space-y-4"
            >
              <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Identity Verified</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {verifiedStudent.lastName}, {verifiedStudent.firstName}{" "}
                    {verifiedStudent.middleName
                      ? `${verifiedStudent.middleName[0]}.`
                      : ""}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline">
                      ID: {verifiedStudent.studentId}
                    </Badge>
                    <Badge variant="secondary">
                      {verifiedStudent.departmentAcronym ||
                        verifiedStudent.department}
                    </Badge>
                    <Badge variant="secondary">{verifiedStudent.yearLevel}</Badge>
                  </div>
                </div>
              </div>

              <FieldGroup className="space-y-3">
                <Field>
                  <FieldLabel htmlFor="email">Active Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan.delacruz@gmail.com"
                    {...emailForm.register("email")}
                    data-invalid={!!emailForm.formState.errors.email}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    This email will be linked to your voter account for login
                    OTPs and ballot notifications.
                  </p>
                  <FieldError errors={[emailForm.formState.errors.email]} />
                </Field>
              </FieldGroup>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("verify-identity")}
                  className="gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send Verification Code"}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP Verification */}
          {step === "otp" && (
            <form
              onSubmit={otpForm.handleSubmit(onSubmitOtp)}
              className="space-y-4"
            >
              <div className="text-center space-y-1 py-1">
                <Mail className="mx-auto h-8 w-8 text-primary/80 mb-2" />
                <h4 className="font-semibold text-sm">Enter Verification Code</h4>
                <p className="text-xs text-muted-foreground">
                  We sent a 6-digit verification code to:
                  <br />
                  <span className="font-medium text-foreground">
                    {emailForOtp}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <Controller
                  name="pin"
                  control={otpForm.control}
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
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
                <FieldError errors={[otpForm.formState.errors.pin]} />
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Activating Account..." : "Confirm & Enter Portal"}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("email")}
                  className="gap-1 text-muted-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change Email
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-primary"
                >
                  Resend Code
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
