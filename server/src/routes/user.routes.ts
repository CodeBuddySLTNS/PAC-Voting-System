import { Router } from "express";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";
import { UserController } from "../controllers/user.controllers";
import { multerUpload } from "../middlewares/multer-upload";
import { permissions } from "../middlewares/permissions";

const router = Router();

router.use(authenticate);

router.get("/students", tryCatch(UserController.getAllStudents));
router.patch(
  "/students/:id/toggle-status",
  permissions.admin,
  tryCatch(UserController.toggleStudentStatus),
);
router.patch(
  "/students/:id",
  permissions.admin,
  multerUpload.single("image"),
  tryCatch(UserController.updateStudent),
);
router.post(
  "/students/import",
  permissions.admin,
  tryCatch(UserController.importStudents),
);
router.post(
  "/students/make-all-eligible",
  permissions.admin,
  tryCatch(UserController.makeAllStudentsEligible),
);

router.patch(
  "/profile",
  multerUpload.single("image"),
  tryCatch(UserController.updateMyProfile),
);

export default router;
