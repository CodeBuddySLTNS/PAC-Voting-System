import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const signupSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  studentId: z.string().min(1, "Student ID is required"),
  course: z.string().min(1, "Course/Program is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type SignupFormValues = z.infer<typeof signupSchema>

export function useSignupForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      studentId: "",
      course: "",
      password: "",
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Signup submitted:", data)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    isLoading,
    onSubmit,
  }
}
