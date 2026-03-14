import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";
import { validate } from "../middlewares/validate";
import { loginSchema, signupSchema } from "../models/auth.models";
import { tryCatch } from "../lib/utils";
import authenticate from "../middlewares/authentication";

const router = Router();

router.post("/signup", validate(signupSchema), tryCatch(AuthController.signup));
// router.post("/login", validate(loginSchema), tryCatch(AuthController.login));
// router.get("/refresh-token", tryCatch(AuthController.refreshToken));
// router.post("/logout", tryCatch(AuthController.logout));
// router.get("/me", authenticate, tryCatch(AuthController.me));

export default router;
