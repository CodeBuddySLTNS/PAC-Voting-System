import { Router } from "express";
import { tryCatch } from "../lib/utils";
import {
  createCandidateSchema,
  updateCandidateSchema,
} from "../models/candidate.models";
import { CandidateController } from "../controllers/candidate.controllers";
import { validate } from "../middlewares/validate";
import authenticate from "../middlewares/authentication";
import { permissions } from "../middlewares/permissions";

const router = Router();

router.use(authenticate);
router.use(permissions.admin);

// /api/candidates
router.get(
  "/election/:electionId",
  tryCatch(CandidateController.getCandidatesByElection),
);
router.post(
  "/",
  validate(createCandidateSchema),
  tryCatch(CandidateController.createCandidate),
);
router.patch(
  "/:id",
  validate(updateCandidateSchema),
  tryCatch(CandidateController.updateCandidate),
);
router.delete("/:id", tryCatch(CandidateController.deleteCandidate));

export default router;
