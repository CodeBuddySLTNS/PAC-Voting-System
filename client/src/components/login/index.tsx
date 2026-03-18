import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLoginForm } from "@/hooks/useLoginForm";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Controller } from "react-hook-form";

export function Login() {
  const {
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
  } = useLoginForm();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="border-0 p-5 shadow-none sm:border sm:bg-card sm:shadow-sm">
      <CardContent className="p-0">
        {step === "credentials" ? (
          <Tabs
            defaultValue="student"
            value={role}
            onValueChange={(v) => {
              setRole(v as "student" | "officer");
              if (v === "student") studentForm.reset();
              else officerForm.reset();
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
                onSubmit={studentForm.handleSubmit(onSubmitStudent)}
                className="space-y-4 data-[state=inactive]:hidden"
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      placeholder="juantamad@gmail.com"
                      {...studentForm.register("email")}
                      data-invalid={!!studentForm.formState.errors.email}
                    />
                    <FieldError errors={[studentForm.formState.errors.email]} />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="student-password">
                        Password
                      </FieldLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="student-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...studentForm.register("password")}
                        data-invalid={!!studentForm.formState.errors.password}
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
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                    <FieldError
                      errors={[studentForm.formState.errors.password]}
                    />
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  className="w-full cursor-pointer hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="mt-2 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="officer">
              <form
                onSubmit={officerForm.handleSubmit(onSubmitOfficer)}
                className="space-y-4 data-[state=inactive]:hidden"
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="officer-email">Email</FieldLabel>
                    <Input
                      id="officer-email"
                      placeholder="juantamad@gmail.com"
                      {...officerForm.register("email")}
                      data-invalid={!!officerForm.formState.errors.email}
                    />
                    <FieldError errors={[officerForm.formState.errors.email]} />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="officer-password">
                        Password
                      </FieldLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative leading-none">
                      <Input
                        id="officer-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...officerForm.register("password")}
                        data-invalid={!!officerForm.formState.errors.password}
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
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                    <FieldError
                      errors={[officerForm.formState.errors.password]}
                    />
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  className="w-full cursor-pointer hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(onVerifyOtp)}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a 6-digit verification code to
                <br />
                <span className="font-medium text-foreground">
                  {emailForOtp}
                </span>
              </p>
            </div>

            <Field className="flex justify-center text-center">
              <Controller
                control={otpForm.control}
                name="pin"
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
              <FieldError errors={[otpForm.formState.errors.pin]} />
            </Field>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => setStep("credentials")}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
