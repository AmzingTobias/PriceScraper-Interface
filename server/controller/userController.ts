import { Request, Response } from "express";
import { compare_hashed_password, hashPassword } from "../common/security";
import { getDatabase } from "../data/database";
import { get_today_date_as_string } from "../common/date";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} from "../common/status_codes";
import sqlite3, { INTERNAL } from "sqlite3";
import { USER_ID_MISSING_MSG } from "../common/user";

const db = getDatabase();

/**
 * Create a user account in the database
 * @param req The request object, it should contain a username and password in the body
 * @param res The response object
 */
export const create_account = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (typeof username === "string" && typeof password !== "undefined") {
    const username_lower = (username as string).toLowerCase().trim();
    const todays_date = get_today_date_as_string();
    const hashed_password = await hashPassword(password);
    db.run(
      "INSERT INTO Users (Username, Password, Date_created) VALUES (?, ?, ?)",
      [username_lower, hashed_password, todays_date],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            res
              .status(BAD_REQUEST_CODE)
              .send(`Username "${username}" already in use`);
          } else {
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
            console.error(err);
          }
        } else {
          if (this.changes > 0) {
            res.send(`User: ${username} created`);
          } else {
            res
              .status(INTERNAL_SERVER_ERROR_CODE)
              .send(`User: ${username} could not be created`);
          }
        }
      }
    );
  } else {
    res.status(BAD_REQUEST_CODE).send("Missing request fields");
  }
};

/**
 * Update a password for the user account
 * @param req The request object. It should contain a userId in the request body
 * @param res The response object
 */
export const update_password = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  const { password } = req.body;
  if (typeof user_id === "number" && typeof password === "string") {
    const hashed_password = await hashPassword(password);
    db.run(
      "UPDATE Users SET Password = ? WHERE Id = ?",
      [hashed_password, user_id],
      function (err) {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          if (this.changes > 0) {
            res.send("Password updated");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(`User: ${user_id} does not exist`);
          }
        }
      }
    );
  } else {
    res.status(BAD_REQUEST_CODE).send("Missing request fields");
  }
};

/**
 * A type for what the data will look like, when it is received from the Users table
 */
type userAccount = {
  Id: number;
  Username: string;
  Password: string;
  Date_created: string;
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
    db.get(
      "SELECT * FROM Users WHERE username = ?",
      [username_lower],
      async (err, row) => {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          if (typeof row !== "undefined") {
            const user_account = row as userAccount;
            const password_valid = await compare_hashed_password(
              password,
              user_account.Password
            );
            if (password_valid) {
              res.status(200).end();
            } else {
              res.status(401).end();
            }
          } else {
            res.status(BAD_REQUEST_CODE).end();
          }
        }
      }
    );
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
  const user_id = req.body["UserId"];
  if (typeof user_id === "number") {
    db.get(
      "SELECT * FROM Admins Where User_Id = ?",
      user_id,
      function (err, row) {
        if (err) {
          console.error(err);
          res.send(INTERNAL_SERVER_ERROR_CODE);
        }
        if (typeof row === "undefined") {
          res.json(false);
        } else {
          res.json(true);
        }
      }
    );
  } else {
    res.status(INTERNAL_SERVER_ERROR_CODE).send(USER_ID_MISSING_MSG);
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
    const email_trimmed = email.trim();
    const email_lower = email_trimmed.toLowerCase();
    // TODO Check email is an email
    db.run(
      "INSERT INTO Emails (Email, User_Id) VALUES (?, ?)",
      [email_lower, user_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            if (
              err.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
            ) {
              res
                .status(BAD_REQUEST_CODE)
                .send(`User: ${user_id} does not exist`);
            } else {
              res.status(BAD_REQUEST_CODE).send(`User or Email already in use`);
            }
          } else {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          }
        } else {
          if (this.changes > 0) {
            res.send(`Email added for user: ${user_id}`);
          } else {
            res.status(BAD_REQUEST_CODE).send("Email could not be added");
          }
        }
      }
    );
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
  const user_id = req.body["UserId"];
  if (typeof user_id === "number") {
    db.get(
      "SELECT Email FROM Emails WHERE User_Id = ?",
      user_id,
      (err, row) => {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE);
        } else {
          res.json(row);
        }
      }
    );
  } else {
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
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
    const email_trimmed = email.trim();
    const email_lower = email_trimmed.toLowerCase();
    db.run(
      "UPDATE Emails SET Email = ? WHERE User_Id = ?",
      [email_lower, user_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            if (
              err.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
            ) {
              res
                .status(BAD_REQUEST_CODE)
                .send(`User: ${user_id} does not exist`);
            } else {
              res.status(BAD_REQUEST_CODE).send(`Email already in use`);
            }
          } else {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          }
        } else {
          if (this.changes > 0) {
            res.send("Email updated");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("User does not have an email on their account");
          }
        }
      }
    );
  } else {
    res.status(BAD_REQUEST_CODE).send("Missing request fields");
  }
};
