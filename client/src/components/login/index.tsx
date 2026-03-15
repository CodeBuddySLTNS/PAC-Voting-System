import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useLoginForm } from "@/hooks/useLoginForm"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Login() {
  const {
    role,
    setRole,
    isLoading,
    studentForm,
    officerForm,
    onSubmitStudent,
    onSubmitOfficer,
  } = useLoginForm()

  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card className="p-5 border-0 shadow-none sm:border sm:shadow-sm sm:bg-card">
      <CardContent className="p-0">
        <Tabs defaultValue="student" value={role} onValueChange={(v) => {
          setRole(v as "student" | "officer")
          if (v === "student") studentForm.reset()
          else officerForm.reset()
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-10 px-1 py-1">
            <TabsTrigger value="student" className="h-8">Student</TabsTrigger>
            <TabsTrigger value="officer" className="h-8">Election Officer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student">
            <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-4 data-[state=inactive]:hidden">
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
                    <FieldLabel htmlFor="student-password">Password</FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline underline-offset-4"
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
                      className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-md px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </button>
                  </div>
                  <FieldError errors={[studentForm.formState.errors.password]} />
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="mt-2 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/auth/signup" className="font-medium text-primary hover:underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="officer">
            <form onSubmit={officerForm.handleSubmit(onSubmitOfficer)} className="space-y-4 data-[state=inactive]:hidden">
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
                    <FieldLabel htmlFor="officer-password">Password</FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="officer-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...officerForm.register("password")}
                      data-invalid={!!officerForm.formState.errors.password}
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
                  <FieldError errors={[officerForm.formState.errors.password]} />
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
