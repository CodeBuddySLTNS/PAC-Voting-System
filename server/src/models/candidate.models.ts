import { z } from "zod";

export const createCandidateSchema = z.object({
  body: z.object({
    electionId: z.number().min(1, "Election ID is required"),
    positionId: z.number().min(1, "Position ID is required"),
    partyList: z.string().optional(),
    
    // Exactly one of: studentId OR (name)
    studentId: z.number().optional(),
    name: z.string().optional(),
    imageUrl: z.string().optional(),
  }).refine((data) => data.studentId || data.name, {
    message: "Candidate must either be a registered student or have a custom name.",
    path: ["name"],
  }),
});

export const updateCandidateSchema = z.object({
  body: z.object({
    positionId: z.number().optional(),
    partyList: z.string().optional(),
    name: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>["body"];
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>["body"];
