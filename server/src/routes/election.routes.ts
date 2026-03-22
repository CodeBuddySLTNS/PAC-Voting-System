import { Router } from "express";
import { ElectionController } from "../controllers/election.controllers";
import { validate } from "../middlewares/validate";
import { createElectionSchema, updateElectionSchema } from "../models/election.models";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";

const router = Router();

// Endpoints for managing elections (academic years)
router.get("/", authenticate, tryCatch(ElectionController.getAll));
router.get("/:id/results", authenticate, tryCatch(ElectionController.getResults));
router.post("/", authenticate, validate(createElectionSchema), tryCatch(ElectionController.create));
router.patch("/:id", authenticate, validate(updateElectionSchema), tryCatch(ElectionController.update));
router.delete("/:id", authenticate, tryCatch(ElectionController.delete));

export default router;
