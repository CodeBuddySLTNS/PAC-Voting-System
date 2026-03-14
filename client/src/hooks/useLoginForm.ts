import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export type LoginRole = "student" | "officer"

const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  password: z.string().min(1, "Password is required"),
})

const officerSchema = z.object({
  username: z.string().min(1, "Username or Email is required"),
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
      studentId: "",
      password: "",
    },
  })

  const officerForm = useForm<OfficerLoginFormValues>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      username: "",
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
