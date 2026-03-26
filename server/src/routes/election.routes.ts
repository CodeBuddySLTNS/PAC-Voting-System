import { Router } from "express";
import { ElectionController } from "../controllers/election.controllers";
import { validate } from "../middlewares/validate";
import {
  createElectionSchema,
  updateElectionSchema,
} from "../models/election.models";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";
import { permissions } from "../middlewares/permissions";

const router = Router();

router.use(authenticate);

// Endpoints for managing elections (academic years)
router.get("/", tryCatch(ElectionController.getAll));
router.get("/:id/results", tryCatch(ElectionController.getResults));
router.post(
  "/",
  permissions.admin,
  validate(createElectionSchema),
  tryCatch(ElectionController.create),
);
router.patch(
  "/:id",
  permissions.admin,
  validate(updateElectionSchema),
  tryCatch(ElectionController.update),
);
router.delete("/:id", permissions.admin, tryCatch(ElectionController.delete));

export default router;
