import { getDatabase } from "../data/database";

export const USER_ID_MISSING_MSG = "UserId missing in request";

const db = getDatabase();

/**
 * A type for what the data will look like, when it is received from the Users table
 */
export type tUserAccount = {
  Id: number;
  Username: string;
  Password: string;
  Date_created: string;
};

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
