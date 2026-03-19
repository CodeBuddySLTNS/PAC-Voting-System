import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useSignupForm } from "@/hooks/use-signup-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Controller } from "react-hook-form";
import { useDepartments, useYearLevels } from "@/hooks/use-config";

export function Signup() {
  const { data: departments } = useDepartments();
  const { data: yearLevels } = useYearLevels();
  const {
    form,
    otpForm,
    step,
    setStep,
    isLoading,
    emailForOtp,
    onSubmitSignup,
    onSubmitOtp,
  } = useSignupForm();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="border-0 p-5 shadow-none sm:border sm:bg-card sm:shadow-sm">
      <CardContent className="p-0">
        {step === "credentials" ? (
          <form
            onSubmit={form.handleSubmit(onSubmitSignup)}
            className="space-y-4"
          >
            <FieldGroup>
              <div className="grid w-full grid-cols-1 gap-2.5 md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    {...form.register("firstName")}
                    data-invalid={!!form.formState.errors.firstName}
                  />
                  <FieldError errors={[form.formState.errors.firstName]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="middleName">Middle Name</FieldLabel>
                  <Input
                    id="middleName"
                    placeholder="Garcia"
                    {...form.register("middleName")}
                    data-invalid={!!form.formState.errors.middleName}
                  />
                  <FieldError errors={[form.formState.errors.middleName]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    placeholder="Dela Cruz"
                    {...form.register("lastName")}
                    data-invalid={!!form.formState.errors.lastName}
                  />
                  <FieldError errors={[form.formState.errors.lastName]} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Field>
                  <FieldLabel htmlFor="departmentId">Department</FieldLabel>
                  <Controller
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <SelectTrigger
                          id="departmentId"
                          data-invalid={!!form.formState.errors.departmentId}
                        >
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.acronym}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[form.formState.errors.departmentId]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="yearLevelId">Year Level</FieldLabel>
                  <Controller
                    control={form.control}
                    name="yearLevelId"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <SelectTrigger
                          id="yearLevelId"
                          data-invalid={!!form.formState.errors.yearLevelId}
                        >
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearLevels?.map((yl) => (
                            <SelectItem key={yl.id} value={String(yl.id)}>
                              {yl.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[form.formState.errors.yearLevelId]} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  placeholder="juandelacruz@gmail.com"
                  {...form.register("email")}
                  data-invalid={!!form.formState.errors.email}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative leading-none">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...form.register("password")}
                    data-invalid={!!form.formState.errors.password}
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
                <FieldError errors={[form.formState.errors.password]} />
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              className="mt-2 w-full cursor-pointer hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Sending code..." : "Sign up"}
            </Button>

            <div className="mt-2 text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </div>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(onSubmitOtp)}
            className="animate-in space-y-6 fade-in"
          >
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit verification code to
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
                className="w-full cursor-pointer hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code & Register"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => setStep("credentials")}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to registration
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
