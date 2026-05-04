import { Router } from "express";
import { ConfigController } from "../controllers/config.controllers";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";
import { permissions } from "../middlewares/permissions";

const router = Router();

router.get("/departments", tryCatch(ConfigController.getDepartments));
router.get("/year-levels", tryCatch(ConfigController.getYearLevels));
router.get(
  "/academic-years",
  authenticate,
  tryCatch(ConfigController.getAcademicYears),
);
router.post(
  "/academic-years",
  [authenticate, permissions.admin],
  tryCatch(ConfigController.createAcademicYear),
);

router.get("/positions", tryCatch(ConfigController.getPositions));
router.post(
  "/positions",
  [authenticate, permissions.admin],
  tryCatch(ConfigController.createPosition),
);

router.get(
  "/students/search",
  [authenticate, permissions.admin],
  tryCatch(ConfigController.searchStudents),
);

export default router;
