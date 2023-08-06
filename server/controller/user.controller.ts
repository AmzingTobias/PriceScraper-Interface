import { Request, Response } from "express";
import { compare_hashed_password, hashPassword } from "../common/security";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  UNAUTHORIZED_REQUEST_CODE,
} from "../common/status_codes";
import { USER_ID_MISSING_MSG, is_email_valid } from "../common/user";
import {
  addEmailForUser,
  createUser,
  getEmailForUserWithId,
  getUserWithUsername,
  isUserAdmin,
  updateUserEmail,
  updateUserPassword,
} from "../models/user.model";
import jwt from "jsonwebtoken";

/**
 * Create a user account
 * @param req The request object, it should contain a username and password in the body
 * @param res The response object
 */
export const create_account = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (typeof username === "string" && typeof password !== "undefined") {
    const username_lower = username.toLowerCase().trim();
    const hashed_password = await hashPassword(password);
    createUser(username, hashed_password)
      .then((created) => {
        if (created) {
          res.json(`User: ${username_lower} created`);
        } else {
          res
            .status(BAD_REQUEST_CODE)
            .json(`User: ${username_lower} already exists`);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  } else {
    res.status(BAD_REQUEST_CODE).send("Missing request fields");
  }
};

/**
 * Update a password
 * @param req The request object. It should contain a userId in the request body
 * @param res The response object
 */
export const update_password = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  const { password } = req.body;
  if (typeof user_id === "number" && typeof password === "string") {
    if (req.user !== undefined && req.user.Id === user_id) {
      const hashed_password = await hashPassword(password);
      updateUserPassword(user_id, hashed_password)
        .then((updated) => {
          if (updated) {
            res.send("Password updated");
          } else {
            // This should never be reached, due to the previous authentication checking
            res.status(BAD_REQUEST_CODE).send("User does not exist");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
  } else {
    res.status(BAD_REQUEST_CODE).send("Missing request fields");
  }
};

/**
 * Login query
 * @param req The request object. It should contain a username and password in its request body
 * @param res The response object
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (typeof username === "string" && typeof password === "string") {
    const username_lower = username.toLowerCase();
    getUserWithUsername(username_lower)
      .then(async (user_account) => {
        if (user_account === undefined) {
          res.status(UNAUTHORIZED_REQUEST_CODE).end();
        } else {
          const password_valid = await compare_hashed_password(
            password,
            user_account.Password
          );
          if (password_valid) {
            const token = jwt.sign(
              {
                Id: user_account.Id,
              },
              process.env.API_SECRET as string,
              { expiresIn: 86400 }
            );
            res.status(200).json({ token: token });
          } else {
            res.status(UNAUTHORIZED_REQUEST_CODE).end();
          }
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).end();
      });
  } else {
    res.status(BAD_REQUEST_CODE).end();
  }
};

/**
 * Check if an account is marked as an administrator
 * @param req The request object. It should contain a userId in the request body
 * @param res The response object
 */
export const is_account_admin = async (req: Request, res: Response) => {
  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("User not found");
  } else {
    const user_id = req.body["UserId"];
    if (typeof user_id === "number") {
      isUserAdmin(user_id)
        .then((result) => {
          res.json(result);
        })
        .catch((error) => {
          console.error(error);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(INTERNAL_SERVER_ERROR_CODE).send(USER_ID_MISSING_MSG);
    }
  }
};

/**
 * Add an email to an account
 * @param req The request object. It should contain a userId in the request body
 * @param res The response object
 */
export const add_email = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  const email = req.body["Email"];
  if (typeof user_id === "number" && typeof email === "string") {
    if (req.user !== undefined && req.user.Id === user_id) {
      const email_lower = email.trim().toLowerCase();
      if (is_email_valid(email_lower)) {
        addEmailForUser(user_id, email)
          .then((email_added) => {
            if (email_added) {
              res.send(`Email: ${email} added to user: ${user_id}`);
            } else {
              res
                .status(BAD_REQUEST_CODE)
                .send(
                  "User already has an email, Email is already in use, or user does not exist"
                );
            }
          })
          .catch((err) => {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          });
      } else {
        res.status(BAD_REQUEST_CODE).send("Email invalid");
      }
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
  } else {
    res.status(BAD_REQUEST_CODE).send("Missing request fields");
  }
};

/**
 * Get an email registered for an account
 * @param req The request object. It should contain a user Id in the request body
 * @param res The response object
 */
export const get_email = async (req: Request, res: Response) => {
  if (req.user === undefined) {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("User not found");
  } else {
    const user_id = req.body["UserId"];
    if (typeof user_id !== "number") {
      res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
    } else {
      const user_is_admin = await isUserAdmin(req.user.Id);
      if (user_is_admin || req.user.Id === user_id) {
        getEmailForUserWithId(user_id)
          .then((email) => {
            if (email === "") {
              res.json({ Email: null });
            } else {
              res.json({ Email: email });
            }
          })
          .catch((err) => {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          });
      } else {
        res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
      }
    }
  }
};

/**
 * Update an email on an account
 * @param req The request object. It should contain a userId and email in the request body
 * @param res The response object
 */
export const update_email = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  const email = req.body["Email"];
  if (typeof user_id === "number" && typeof email === "string") {
    if (req.user !== undefined && req.user.Id === user_id) {
      const email_lower = email.trim().toLowerCase();
      if (is_email_valid(email_lower)) {
        updateUserEmail(user_id, email_lower)
          .then((email_updated) => {
            if (email_updated) {
              res.send(`Email: ${email} set for user: ${user_id}`);
            } else {
              res
                .status(BAD_REQUEST_CODE)
                .send("Email already exists or user does not exist");
            }
          })
          .catch((err) => {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          });
      } else {
        res.status(BAD_REQUEST_CODE).send("Email invalid");
      }
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
  } else {
    res.status(BAD_REQUEST_CODE).send("Missing request fields");
  }
};
