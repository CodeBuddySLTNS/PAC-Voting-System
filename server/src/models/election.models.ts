import { z } from "zod";

export const createElectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Election name is required"),
    academicYearId: z.number().min(1, "Academic Year is required"),
    isActive: z.boolean().optional().default(false),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  }),
});

export const updateElectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Election name is required"),
    academicYearId: z.number().min(1, "Academic Year is required"),
    isActive: z.boolean().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
  }),
});

export type CreateElectionInput = z.infer<typeof createElectionSchema>["body"];
export type UpdateElectionInput = z.infer<typeof updateElectionSchema>["body"];
