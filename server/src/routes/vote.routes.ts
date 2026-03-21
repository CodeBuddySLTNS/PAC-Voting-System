import { Router } from "express";
import { VoteController } from "../controllers/vote.controllers";
import { validate } from "../middlewares/validate";
import { submitVoteSchema } from "../models/vote.models";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";

const router = Router();

// /api/votes
router.get("/elections", authenticate, tryCatch(VoteController.getElections));
router.get("/elections/:id/ballot", authenticate, tryCatch(VoteController.getBallot));
router.post("/elections/:id/submit", authenticate, validate(submitVoteSchema), tryCatch(VoteController.submitVote));

export default router;
