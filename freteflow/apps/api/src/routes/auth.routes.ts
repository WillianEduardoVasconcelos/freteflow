import { Router } from "express";
import {
  postLogin,
  postLogout,
  postRefresh,
  postTwoFactorSetup,
  postTwoFactorVerify,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../config/csrf.js";
import { validateBody } from "../middleware/validation.middleware.js";
import { loginSchema, twoFactorCodeSchema } from "../validation/schemas.js";

const authRoutes = Router();

authRoutes.post("/login", validateBody(loginSchema), postLogin);
authRoutes.post("/refresh", csrfProtection, postRefresh);
authRoutes.post("/logout", csrfProtection, postLogout);
authRoutes.post("/2fa/setup", authenticate, postTwoFactorSetup);
authRoutes.post(
  "/2fa/verify",
  authenticate,
  validateBody(twoFactorCodeSchema),
  postTwoFactorVerify,
);

export default authRoutes;
