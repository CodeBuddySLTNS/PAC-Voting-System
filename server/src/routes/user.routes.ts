import { Router } from "express";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";
import { UserController } from "../controllers/user.controllers";

const router = Router();

router.use(authenticate);

router.get("/students", tryCatch(UserController.getAllStudents));
router.patch(
  "/students/:id/toggle-status",
  tryCatch(UserController.toggleStudentStatus),
);

export default router;
