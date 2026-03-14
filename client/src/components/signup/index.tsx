import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useSignupForm } from "@/hooks/useSignupForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"

export function Signup() {
  const {
    form,
    isLoading,
    onSubmit,
  } = useSignupForm()

  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card className="p-5 border-0 shadow-none sm:border sm:shadow-sm sm:bg-card">
      <CardContent className="p-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                id="fullName"
                placeholder="Juan Dela Cruz"
                {...form.register("fullName")}
                data-invalid={!!form.formState.errors.fullName}
              />
              <FieldError errors={[form.formState.errors.fullName]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
                <Input
                  id="studentId"
                  placeholder="Ex. 19-0123"
                  {...form.register("studentId")}
                  data-invalid={!!form.formState.errors.studentId}
                />
                <FieldError errors={[form.formState.errors.studentId]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="course">Course / Program</FieldLabel>
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
                  className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-md px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </button>
              </div>
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>

          <div className="mt-2 text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-primary hover:underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
