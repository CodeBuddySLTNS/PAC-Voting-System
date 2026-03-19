import { Router } from "express";
import { ConfigController } from "../controllers/config.controllers";
import { tryCatch } from "../lib/utils";

const router = Router();

router.get("/departments", tryCatch(ConfigController.getDepartments));
router.get("/year-levels", tryCatch(ConfigController.getYearLevels));

export default router;
