import { Request, Response } from "express";
import { getDatabase } from "../data/database";
import sqlite3 from "sqlite3";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} from "../common/status_codes";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import { USER_ID_MISSING_MSG } from "../common/user";

const db = getDatabase();

export const link_user_to_product_for_notification = (
  req: Request,
  res: Response
) => {
  const product_id = req.body["ProductId"];
  const user_id = req.body["UserId"];
  if (typeof product_id !== "undefined" && typeof user_id !== "undefined") {
    db.run(
      "INSERT INTO Product_notifications (Product_Id, User_Id) VALUES (?, ?)",
      [product_id, user_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            if (
              err.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
            ) {
              res
                .status(BAD_REQUEST_CODE)
                .send(
                  `Product: ${product_id} or User: ${user_id} does not exist`
                );
            } else {
              res
                .status(BAD_REQUEST_CODE)
                .send(
                  `User: ${user_id} already being notified for product: ${product_id}`
                );
            }
          } else {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          }
        } else {
          if (this.changes > 0) {
            res.send(`User: ${user_id} linked to product: ${product_id}`);
          } else {
            res.status(BAD_REQUEST_CODE).send("Error linking user to product");
          }
        }
      }
    );
  } else if (typeof product_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
  }
};

export const remove_user_notification_for_product = (
  req: Request,
  res: Response
) => {
  const product_id = req.body["ProductId"];
  const user_id = req.body["UserId"];
  if (typeof product_id !== "undefined" && typeof user_id !== "undefined") {
    db.run(
      "DELETE FROM Product_notifications WHERE Product_Id = ? AND User_Id = ?",
      [product_id, user_id],
      function (err) {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          if (this.changes > 0) {
            res.send(
              `User: ${user_id} is no longer being notified for product: ${product_id}`
            );
          } else {
            res.send(
              `User: ${user_id} was never being notified of product: ${product_id}`
            );
          }
        }
      }
    );
  } else if (typeof product_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
  }
};
