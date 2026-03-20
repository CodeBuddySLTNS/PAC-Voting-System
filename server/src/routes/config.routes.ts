import { Router } from "express";
import { ConfigController } from "../controllers/config.controllers";
import { tryCatch } from "../lib/utils";

const router = Router();

router.get("/departments", tryCatch(ConfigController.getDepartments));
router.get("/year-levels", tryCatch(ConfigController.getYearLevels));
router.get("/academic-years", tryCatch(ConfigController.getAcademicYears));
router.post("/academic-years", tryCatch(ConfigController.createAcademicYear));

router.get("/positions", tryCatch(ConfigController.getPositions));
router.post("/positions", tryCatch(ConfigController.createPosition));

router.get("/students/search", tryCatch(ConfigController.searchStudents));

export default router;
