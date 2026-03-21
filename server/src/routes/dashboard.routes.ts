import { Router } from "express";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";
import { DashboardController } from "../controllers/dashboard.controllers";

const router = Router();

// Protect dashboard routes to authenticate
router.use(authenticate);

router.get("/stats", tryCatch(DashboardController.getStats));

export default router;
