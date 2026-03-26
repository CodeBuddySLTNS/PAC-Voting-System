import { Router } from "express";
import { VoteController } from "../controllers/vote.controllers";
import { validate } from "../middlewares/validate";
import { submitVoteSchema } from "../models/vote.models";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";
import { permissions } from "../middlewares/permissions";

const router = Router();

router.use(authenticate);
router.use(permissions.student);

// /api/votes
router.get("/elections", tryCatch(VoteController.getElections));
router.get("/elections/:id/ballot", tryCatch(VoteController.getBallot));
router.post(
  "/elections/:id/submit",
  validate(submitVoteSchema),
  tryCatch(VoteController.submitVote),
);

export default router;
