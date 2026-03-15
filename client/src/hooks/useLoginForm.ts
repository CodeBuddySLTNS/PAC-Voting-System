import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export type LoginRole = "student" | "officer"

const studentSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

const officerSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

export type StudentLoginFormValues = z.infer<typeof studentSchema>
export type OfficerLoginFormValues = z.infer<typeof officerSchema>

export function useLoginForm() {
  const [role, setRole] = useState<LoginRole>("student")
  const [isLoading, setIsLoading] = useState(false)

  const studentForm = useForm<StudentLoginFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const officerForm = useForm<OfficerLoginFormValues>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmitStudent = async (data: StudentLoginFormValues) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Student login submitted:", data)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitOfficer = async (data: OfficerLoginFormValues) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Officer login submitted:", data)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    role,
    setRole,
    isLoading,
    studentForm,
    officerForm,
    onSubmitStudent,
    onSubmitOfficer,
  }
}
