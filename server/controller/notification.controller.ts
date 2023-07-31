import { Request, Response } from "express";
import { getDatabase } from "../data/database";
import sqlite3 from "sqlite3";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} from "../common/status_codes";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import { USER_ID_MISSING_MSG } from "../common/user";
import {
  DISCORD_wEBHOOK_MISSING_MSG,
  ENABLE_NOTIFICATIONS_MISSING_MSG,
  NO_PRICE_CHANGE_NOTIFICATIONS_MISSING_MSG,
} from "../common/notification";

const db = getDatabase();

/**
 * Get the notification settings for a user
 * @param req The request object, containing a UserId
 * @param res The response object
 */
export const get_notification_setting_for_user = async (
  req: Request,
  res: Response
) => {
  const user_id = req.body["UserId"];
  if (typeof user_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
  } else {
    db.get(
      "SELECT Enabled AS `Notifications Enabled`, No_price_change_enabled AS `No Price Change Enabled` FROM Notifications WHERE User_Id = ?",
      user_id,
      (err, row) => {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          res.json(row);
        }
      }
    );
  }
};

/**
 * Set the notification settings for a user
 * @param req The request object, containing if notifications are enabled for the user, and also if notifications
 * should be received, if there is no price change detected for products
 * @param res The response object
 */
export const set_notifications_settings = async (
  req: Request,
  res: Response
) => {
  const enable_notifications = req.body["Enable"];
  const enable_no_price_change_notifications =
    req.body["No price change notifications"];
  const user_id = req.body["UserId"];
  if (
    typeof enable_notifications === "boolean" &&
    typeof enable_no_price_change_notifications === "boolean" &&
    typeof user_id !== "undefined"
  ) {
    db.run(
      "UPDATE Notifications SET Enabled = ?, No_price_change_enabled = ? WHERE User_Id = ?",
      [
        enable_notifications ? 1 : 0,
        enable_no_price_change_notifications ? 1 : 0,
        user_id,
      ],
      function (err) {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          if (this.changes > 0) {
            res.send(
              `User: ${user_id} notification status set to: ${enable_notifications}, no price change notification status set to: ${enable_no_price_change_notifications}`
            );
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(`User: ${user_id} does not exist`);
          }
        }
      }
    );
  } else if (typeof user_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
  } else if (typeof enable_no_price_change_notifications !== "boolean") {
    res
      .status(BAD_REQUEST_CODE)
      .send(NO_PRICE_CHANGE_NOTIFICATIONS_MISSING_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(ENABLE_NOTIFICATIONS_MISSING_MSG);
  }
};

/**
 * Link a user and product together, so that the user can receive notifications
 * for the product, if the price changes
 * @param req The request object, should contain both a ProductId and UserId in the
 * request body
 * @param res The response object
 */
export const link_user_to_product_for_notification = async (
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

/**
 * Remvoe a link between a user and product, so that they no longer receive notifications for the product
 * @param req The request object, should contain both a ProductId and UserId in the
 * request body
 * @param res The response object
 */
export const remove_user_notification_for_product = async (
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

/**
 * Add a discord webhook for a user, so they can receive discord webhook notifications
 * @param req The request object. It should contain a UserId and Webhook in the request body
 * @param res The response object
 */
export const add_discord_webhook = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  const discord_webhook = req.body["Webhook"];
  if (
    typeof user_id !== "undefined" &&
    typeof discord_webhook !== "undefined"
  ) {
    const discord_webhook_trimmed = (discord_webhook as string).trim();
    // Prevent database queries running in parallel
    db.serialize(function () {
      db.run(
        "INSERT INTO Discord_webhooks (User_Id, Discord_webhook) VALUES (?, ?)",
        [user_id, discord_webhook_trimmed],
        function (err) {
          if (err) {
            if (
              err.message ===
              "SQLITE_CONSTRAINT: UNIQUE constraint failed: Discord_webhooks.User_Id"
            ) {
              // Update instead
              db.run(
                "UPDATE Discord_webhooks SET Discord_webhook = ? WHERE User_Id = ?",
                [discord_webhook_trimmed, user_id],
                function (update_err) {
                  if (update_err) {
                    console.error(update_err);
                    res
                      .status(INTERNAL_SERVER_ERROR_CODE)
                      .send("Database error");
                  } else {
                    if (this.changes > 0) {
                      res.send(
                        `Discord webhook: ${discord_webhook} updated for user: ${user_id}`
                      );
                    } else {
                      res
                        .status(BAD_REQUEST_CODE)
                        .send("Could not update webhook");
                    }
                  }
                }
              );
            } else if (
              err.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
            ) {
              res
                .status(BAD_REQUEST_CODE)
                .send(`User: ${user_id} does not exist`);
            } else {
              console.error(err);
              res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
            }
          } else {
            if (this.changes > 0) {
              // Created succesfully
              res.send(
                `Discord webhook: ${discord_webhook} added to user: ${user_id}`
              );
            } else {
              // Didn't create for some reason
              res
                .status(BAD_REQUEST_CODE)
                .send(`Could not add webhook to user`);
            }
          }
        }
      );
    });
  } else if (typeof user_id !== "undefined") {
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(DISCORD_wEBHOOK_MISSING_MSG);
  }
};

/**
 * Remove a discord webhook for a user
 * @param req The request object. It should contain a UserId in the request body
 * @param res The response objectt
 */
export const remove_discord_webhook = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  if (typeof user_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
  } else {
    db.run(
      "DELETE FROM Discord_webhooks WHERE User_Id = ?",
      user_id,
      function (err) {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          if (this.changes > 0) {
            res.send(`Discord webhook removed for user: ${user_id}`);
          } else {
            res.send(
              `User: ${user_id} does not have a discord webhook to remove`
            );
          }
        }
      }
    );
  }
};
