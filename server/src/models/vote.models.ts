import { z } from "zod";

export const submitVoteSchema = z.object({
  body: z.object({
    votes: z.array(
      z.object({
        candidateId: z.number(),
        positionId: z.number(),
      })
    ).min(1, "You must cast at least one vote.")
  })
});

export type SubmitVoteInput = z.infer<typeof submitVoteSchema>["body"];
