import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useSignupForm } from "@/hooks/useSignupForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export function Signup() {
  const { form, isLoading, onSubmit } = useSignupForm();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="border-0 p-5 shadow-none sm:border sm:bg-card sm:shadow-sm">
      <CardContent className="p-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FieldLabel htmlFor="studentId">Department</FieldLabel>
                <Input
                  id="studentId"
                  placeholder="Ex. 19-0123"
                  {...form.register("studentId")}
                  data-invalid={!!form.formState.errors.studentId}
                />
                <FieldError errors={[form.formState.errors.studentId]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="course">Year Level</FieldLabel>
                <Input
                  id="course"
                  placeholder="BSIT"
                  {...form.register("course")}
                  data-invalid={!!form.formState.errors.course}
                />
                <FieldError errors={[form.formState.errors.course]} />
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
              <div className="relative">
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

          <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
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
      </CardContent>
    </Card>
  );
}
