import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";
import { validate } from "../middlewares/validate";
import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../models/auth.models";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";

const router = Router();

router.post("/login", validate(loginSchema), tryCatch(AuthController.loginOtp));
router.post(
  "/login/verify",
  validate(verifyOtpSchema),
  tryCatch(AuthController.loginVerifyOtp),
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

router.get("/refresh-token", tryCatch(AuthController.refreshToken));
router.get("/me", authenticate, tryCatch(AuthController.getProfile));
router.post("/logout", authenticate, tryCatch(AuthController.logout));

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  tryCatch(AuthController.forgotPassword),
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  tryCatch(AuthController.resetPassword),
);

export default router;
