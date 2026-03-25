import { z } from "zod";

export const createAdminSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>["body"];
