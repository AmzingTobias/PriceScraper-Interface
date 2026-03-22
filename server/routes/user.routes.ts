import { Router } from "express";
import {
  add_email,
  create_account,
  get_email,
  get_user_details,
  is_account_admin,
  login,
  update_email,
  update_password,
} from "../controller/user.controller";
import { verify_token } from "../common/security";
import { validate } from "../middleware/validate";
import { authRateLimiter } from "../middleware/rate-limit";
import {
  loginSchema,
  signupSchema,
  changePasswordSchema,
  emailSchema,
} from "../common/validation";

export const userRouter: Router = Router();

// Auth endpoints with rate limiting and validation
userRouter.post("/signup", authRateLimiter, validate(signupSchema), create_account);
userRouter.post("/login", authRateLimiter, validate(loginSchema), login);

// Password change with validation
userRouter.patch(
  "/change-password",
  authRateLimiter,
  verify_token,
  validate(changePasswordSchema),
  update_password
);

// Admin check
userRouter.get("/admin", verify_token, is_account_admin);

// Email management
userRouter.get("/email", verify_token, get_email);
userRouter.patch("/email", verify_token, validate(emailSchema), update_email);
userRouter.post("/email", verify_token, validate(emailSchema), add_email);

// User details
userRouter.get("/", verify_token, get_user_details);
