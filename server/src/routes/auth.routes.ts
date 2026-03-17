import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";
import { validate } from "../middlewares/validate";
import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
} from "../models/auth.models";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";

const router = Router();

router.post("/login", validate(loginSchema), tryCatch(AuthController.login));
router.post(
  "/login-admin",
  validate(loginSchema),
  tryCatch(AuthController.loginAdmin),
);
router.post(
  "/signup/send-otp",
  validate(signupSchema),
  tryCatch(AuthController.sendOtp),
);
router.post(
  "/signup/verify",
  validate(verifyOtpSchema),
  tryCatch(AuthController.verifyOtp),
);

export default router;
