import { Router } from "express";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";
import { AdminController } from "../controllers/admin.controllers";
import { multerUpload } from "../middlewares/multer-upload";
import { permissions } from "../middlewares/permissions";

const router = Router();

router.use(authenticate);
router.use(permissions.admin);

router.get("/", tryCatch(AdminController.getAll));
router.post(
  "/",
  multerUpload.single("image"),
  tryCatch(AdminController.create),
);
router.patch(
  "/:id",
  multerUpload.single("image"),
  tryCatch(AdminController.update),
);
router.delete("/:id", tryCatch(AdminController.remove));

export default router;
