import { z } from "zod";

export const createElectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Election name is required"),
    academicYearId: z.number().min(1, "Academic Year is required"),
    isActive: z.boolean().optional().default(false),
  }),
});

export const updateElectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Election name is required").optional(),
    academicYearId: z.number().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateElectionInput = z.infer<typeof createElectionSchema>["body"];
export type UpdateElectionInput = z.infer<typeof updateElectionSchema>["body"];
