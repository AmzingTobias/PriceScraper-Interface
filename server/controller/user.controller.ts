import { Request, Response } from "express";
import {
  compare_hashed_password,
  hashPassword,
  signToken,
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
  getUserWithUsername,
  isUserAdmin,
  updateUserEmail,
  updateUserPassword,
} from "../models/user.models";

/**
 * Create a user account. Returns a JWT token in the response body.
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

    const token = signToken(user.Id);
    res.status(201).json({ token });
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
      // Issue a fresh token after password change
      const token = signToken(req.user.Id);
      res.json({ message: "Password updated", token });
    } else {
      res.status(INTERNAL_SERVER_ERROR_CODE).send("Failed to update password");
    }
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
  }
};

/**
 * Login. Returns a JWT token in the response body.
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

    const token = signToken(user.Id);
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR_CODE).json({ error: "Server error" });
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
