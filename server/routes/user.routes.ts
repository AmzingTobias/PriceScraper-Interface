import { Router } from "express";
import {
  add_email,
  create_account,
  get_email,
  is_account_admin,
  login,
  update_email,
  update_password,
} from "../controller/userController";
import { verify_token } from "../common/security";

export const userRouter: Router = Router();

// Create a new account
userRouter.post("/signup", create_account);

// Change a password for an account
userRouter.patch("/change-password", verify_token, update_password);

// Login to an account
userRouter.post("/login", login);

// Check if an account is an administrator
userRouter.get("/admin", verify_token, is_account_admin);

// Get an email for an account
userRouter.get("/email", verify_token, get_email);

// Update an email for an account
userRouter.patch("/email", verify_token, update_email);

// Add an email to an account
userRouter.post("/email", verify_token, add_email);
