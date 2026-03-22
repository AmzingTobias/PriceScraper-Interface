import { Request, Response } from "express";
import {
  compare_hashed_password,
  hashPassword,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from "../common/security";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  UNAUTHORIZED_REQUEST_CODE,
} from "../common/status_codes";
import { is_email_valid } from "../common/user";
import {
  addEmailForUser,
  createUser,
  getEmailForUserWithId,
  getUserDetails,
  getUserWithId,
  getUserWithUsername,
  isUserAdmin,
  updateUserEmail,
  updateUserPassword,
} from "../models/user.models";

/**
 * Create a user account. Sets httpOnly access + refresh cookies.
 */
export const create_account = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const username_lower = username.toLowerCase().trim();

  try {
    const hashed_password = await hashPassword(password);
    const created = await createUser(username_lower, hashed_password);

    if (!created) {
      res.status(BAD_REQUEST_CODE).json({ error: "User already exists" });
      return;
    }

    const user = await getUserWithUsername(username_lower);
    if (!user) {
      res.status(INTERNAL_SERVER_ERROR_CODE).json({ error: "Account created but login failed" });
      return;
    }

    setAuthCookies(res, user.Id);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).json({ error: "Database error" });
  }
};

/**
 * Update a password. Requires current_password and new_password.
 */
export const update_password = async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;

  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    return;
  }

  try {
    const user = await getUserWithUsername(req.user.Username);
    if (!user || !user.Password) {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
      return;
    }

    const currentValid = await compare_hashed_password(current_password, user.Password);
    if (!currentValid) {
      res.status(UNAUTHORIZED_REQUEST_CODE).json({ error: "Current password is incorrect" });
      return;
    }

    const hashed = await hashPassword(new_password);
    const updated = await updateUserPassword(req.user.Id, hashed);

    if (updated) {
      // Issue new tokens after password change (invalidates old sessions implicitly when they expire)
      setAuthCookies(res, req.user.Id);
      res.send("Password updated");
    } else {
      res.status(INTERNAL_SERVER_ERROR_CODE).send("Failed to update password");
    }
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
  }
};

/**
 * Login. Sets httpOnly access + refresh cookies.
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const username_lower = username.toLowerCase();

  try {
    const user = await getUserWithUsername(username_lower);
    if (!user) {
      res.status(UNAUTHORIZED_REQUEST_CODE).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await compare_hashed_password(password, user.Password);
    if (!valid) {
      res.status(UNAUTHORIZED_REQUEST_CODE).json({ error: "Invalid credentials" });
      return;
    }

    setAuthCookies(res, user.Id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).json({ error: "Server error" });
  }
};

/**
 * Logout. Clears both auth cookies.
 */
export const logout = async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out" });
};

/**
 * Refresh the access token using the refresh token cookie.
 * Issues a new access token (and rotates the refresh token for security).
 */
export const refresh_token = async (req: Request, res: Response) => {
  const refreshCookie = req.cookies["refresh-token"] as string | undefined;

  if (!refreshCookie) {
    res.status(401).json({ error: "No refresh token" });
    return;
  }

  try {
    const userId = await verifyRefreshToken(refreshCookie);
    if (userId === null) {
      clearAuthCookies(res);
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    // Verify the user still exists
    const user = await getUserWithId(userId);
    if (!user) {
      clearAuthCookies(res);
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Issue new access + refresh tokens (rotation)
    setAuthCookies(res, userId);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    clearAuthCookies(res);
    res.status(401).json({ error: "Refresh failed" });
  }
};

/**
 * Check if the authenticated user is an admin.
 */
export const is_account_admin = async (req: Request, res: Response) => {
  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("User not found");
    return;
  }
  try {
    const result = await isUserAdmin(req.user.Id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
  }
};

/**
 * Add an email to an account.
 */
export const add_email = async (req: Request, res: Response) => {
  const { Email } = req.body;

  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    return;
  }

  try {
    const email_lower = Email.trim().toLowerCase();
    if (!is_email_valid(email_lower)) {
      res.status(BAD_REQUEST_CODE).send("Email invalid");
      return;
    }
    const added = await addEmailForUser(req.user.Id, email_lower);
    if (added) {
      res.send(`Email: ${email_lower} added to user`);
    } else {
      res.status(BAD_REQUEST_CODE).send("User already has an email or email is already in use");
    }
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
  }
};

/**
 * Get the email registered for an account.
 */
export const get_email = async (req: Request, res: Response) => {
  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    return;
  }
  try {
    const email = await getEmailForUserWithId(req.user.Id);
    res.json({ Email: email });
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
  }
};

/**
 * Update an email for an account.
 */
export const update_email = async (req: Request, res: Response) => {
  const { Email } = req.body;

  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    return;
  }

  try {
    const email_lower = Email.trim().toLowerCase();
    if (!is_email_valid(email_lower)) {
      res.status(BAD_REQUEST_CODE).send("Email invalid");
      return;
    }
    const updated = await updateUserEmail(req.user.Id, email_lower);
    if (updated) {
      res.send("Email updated");
    } else {
      res.status(BAD_REQUEST_CODE).send("Could not update email");
    }
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
  }
};

/**
 * Get the user's details.
 */
export const get_user_details = async (req: Request, res: Response) => {
  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    return;
  }
  try {
    const details = await getUserDetails(req.user.Id);
    res.json(details);
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
  }
};
