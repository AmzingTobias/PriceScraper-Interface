import { getDatabase } from "../data/database";
import { tUserAccount, is_email_valid } from "../common/user";
import { get_today_date_as_string } from "../common/date";
import sqlite3 from "sqlite3";
import { resolve } from "path";

const db = getDatabase();

/**
 * Check to see if a user account is an admin
 * @param user_id The user Id to check if they're an admin
 * @returns A Promise boolean, true if the user is an admin, false if they're not
 */
export const isUserAdmin = (user_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT User_Id FROM Admins WHERE User_Id = ?",
      user_id,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (typeof row !== "undefined") {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Get a user account with an Id
 * @param user_id The Id of the user to get the account for
 * @returns A promise of the user account that matches the Id supplied, or undefined if not user account
 * exists
 */
export const getUserWithId = (
  user_id: number
): Promise<tUserAccount | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT Id, Username, Date_created FROM Users WHERE Id = ?",
      user_id,
      (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          if (typeof row !== "undefined") {
            resolve(row as tUserAccount);
          } else {
            resolve(undefined);
          }
        }
      }
    );
  });
};

/**
 * Get a user account with a username
 * @param username The username to find the account with
 * @returns A promise of the user account that matches the username supplied, or undefined if not user account
 * exists
 */
export const getUserWithUsername = (
  username: string
): Promise<tUserAccount | undefined> => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM Users WHERE username = ?", username, (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (row === undefined) {
          resolve(undefined);
        } else {
          resolve(row as tUserAccount);
        }
      }
    });
  });
};

/**
 * Create a user in the database
 * @param username The username to give the new user
 * @param hashed_password The hashed password for the user
 * @returns A promise boolean, true if the user was created, false if the user couldn't be
 * created, because a user with that username already exists. Rejects on any database error
 */
export const createUser = (
  username: string,
  hashed_password: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const todays_date = get_today_date_as_string();
    db.run(
      "INSERT INTO Users (Username, Password, Date_created) VALUES (?, ?, ?)",
      [username, hashed_password, todays_date],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            reject("Database error");
          }
        }
      }
    );
  });
};

/**
 * Update a users password in the database
 * @param user_id The user Id for the user to update the password for
 * @param new_hashed_password The new hashed password for the user
 * @returns A promise with a value of boolean, if true the user's password has been updated,
 * if false the user doesn't exist to update the password for. If rejected, a database error occured
 */
export const updateUserPassword = (
  user_id: number,
  new_hashed_password: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Users SET Password = ? WHERE Id = ?",
      [new_hashed_password, user_id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Add an email to a user account
 * @param user_id The user Id to add the email to
 * @param email The email to add to the database, this should already be
 * validated before calling this function
 * @returns A promise boolean, if true the email has been added to the user
 * account, if false, the email couldn't be added, because the user does not exist,
 * or an email already exists for that account. Rejected if a database error occurs
 */
export const addEmailForUser = (
  user_id: number,
  email: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Emails (Email, User_Id) VALUES (?, ?)",
      [email, user_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            reject("Could not add email to account");
          }
        }
      }
    );
  });
};

/**
 * Get a user's email based on a user Id
 * @param user_id The User Id to get the email for
 * @returns A promise of a string of the user's email, if the user does not
 * have an email, then the string is empty. Reject on any database errors
 */
export const getEmailForUserWithId = (user_id: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT Email FROM Emails WHERE User_Id = ?",
      user_id,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve("");
          } else {
            resolve((row as any).Email);
          }
        }
      }
    );
  });
};

/**
 * Update a user's email in the database
 * @param user_id The Id of the user to update the email for
 * @param email The email to update, this should already be
 * validated before calling this function
 * @returns A promise boolean, if true the email has been updated for the user
 * account, if false, the email couldn't be updated, because the user does not exist,
 * or the email already exists. Rejected if a database error occurs
 */
export const updateUserEmail = (
  user_id: number,
  email: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Emails SET Email = ? WHERE User_Id = ?",
      [email, user_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            reject("Could not update user's email");
          }
        }
      }
    );
  });
};
