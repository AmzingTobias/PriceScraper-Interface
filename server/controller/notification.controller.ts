import { Request, Response } from "express";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  UNAUTHORIZED_REQUEST_CODE,
} from "../common/status_codes";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import { USER_ID_MISSING_MSG } from "../common/user";
import {
  DISCORD_wEBHOOK_MISSING_MSG,
  ENABLE_NOTIFICATIONS_MISSING_MSG,
  NO_PRICE_CHANGE_NOTIFICATIONS_MISSING_MSG,
} from "../common/notification";
import {
  createDiscordWebhook,
  deleteDiscordWebhook,
  getDiscordWebhookWithUserId,
  getUserNotificationSettingsWithId,
  linkUserToProductForNotification,
  unlinkUserFromProductNotification,
  updateDiscordWebhook,
  updateNotificationSettingsWithUserId,
} from "../models/notification.models";
import { isUserAdmin } from "../models/user.models";

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
    if (
      req.user !== undefined &&
      // Only an admin, or the user the notification settings are for can access
      // this request
      ((await isUserAdmin(req.user.Id)) || req.user.Id === Number(user_id))
    ) {
      getUserNotificationSettingsWithId(user_id)
        .then((notification_settings) => {
          if (notification_settings === null) {
            res.status(BAD_REQUEST_CODE).json({});
          } else {
            notification_settings.Enabled = Boolean(
              notification_settings.Enabled
            );
            notification_settings.NoPriceChangeEnabled = Boolean(
              notification_settings.NoPriceChangeEnabled
            );
            res.json(notification_settings);
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
    typeof user_id === "number"
  ) {
    // Only the user the request is for can update their notification settings
    if (req.user !== undefined && req.user.Id === user_id) {
      updateNotificationSettingsWithUserId(user_id, {
        Enabled: enable_notifications,
        NoPriceChangeEnabled: enable_no_price_change_notifications,
      })
        .then((settings_updated) => {
          if (settings_updated) {
            res.send("Settings updated for user");
          } else {
            res.send("User doesn't exist");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
  } else if (typeof user_id !== "number") {
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
  if (typeof product_id === "number" && typeof user_id === "number") {
    if (req.user !== undefined && req.user.Id === user_id) {
      linkUserToProductForNotification(user_id, product_id)
        .then((user_linked) => {
          if (user_linked) {
            res.send(`User: ${user_id} linked to product: ${product_id}`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(
                "User or product does not exist, or user is aready receiving notifications for product"
              );
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
  } else if (typeof product_id !== "number") {
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
  if (typeof product_id === "number" && typeof user_id === "number") {
    // Only the user that is removing their notifications for the product
    // can make this request
    if (req.user !== undefined && req.user.Id === user_id) {
      unlinkUserFromProductNotification(user_id, product_id)
        .then((unlinked_notification) => {
          if (unlinked_notification) {
            res.send(
              `User: ${user_id} no longer receiving notifications for product: ${product_id}`
            );
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("User was never receving notifications for product");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
  } else if (typeof product_id !== "number") {
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
    if (req.user !== undefined && req.user.Id === user_id) {
      const discord_webhook_trimmed = (discord_webhook as string).trim();
      createDiscordWebhook(user_id, discord_webhook_trimmed)
        .then((webhook_created) => {
          if (webhook_created) {
            res.send("Discord webhook created for user");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(
                "User does not exist, or disord webhook already exists for user"
              );
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
    // Prevent database queries running in parallel
    // db.serialize(function () {
    //   db.run(
    //     "INSERT INTO Discord_webhooks (User_Id, Discord_webhook) VALUES (?, ?)",
    //     [user_id, discord_webhook_trimmed],
    //     function (err) {
    //       if (err) {
    //         if (
    //           err.message ===
    //           "SQLITE_CONSTRAINT: UNIQUE constraint failed: Discord_webhooks.User_Id"
    //         ) {
    //           // Update instead
    //           db.run(
    //             "UPDATE Discord_webhooks SET Discord_webhook = ? WHERE User_Id = ?",
    //             [discord_webhook_trimmed, user_id],
    //             function (update_err) {
    //               if (update_err) {
    //                 console.error(update_err);
    //                 res
    //                   .status(INTERNAL_SERVER_ERROR_CODE)
    //                   .send("Database error");
    //               } else {
    //                 if (this.changes > 0) {
    //                   res.send(
    //                     `Discord webhook: ${discord_webhook} updated for user: ${user_id}`
    //                   );
    //                 } else {
    //                   res
    //                     .status(BAD_REQUEST_CODE)
    //                     .send("Could not update webhook");
    //                 }
    //               }
    //             }
    //           );
    //         } else if (
    //           err.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
    //         ) {
    //           res
    //             .status(BAD_REQUEST_CODE)
    //             .send(`User: ${user_id} does not exist`);
    //         } else {
    //           console.error(err);
    //           res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
    //         }
    //       } else {
    //         if (this.changes > 0) {
    //           // Created succesfully
    //           res.send(
    //             `Discord webhook: ${discord_webhook} added to user: ${user_id}`
    //           );
    //         } else {
    //           // Didn't create for some reason
    //           res
    //             .status(BAD_REQUEST_CODE)
    //             .send(`Could not add webhook to user`);
    //         }
    //       }
    //     }
    //   );
    // });
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
    if (req.user !== undefined && req.user.Id === user_id) {
      deleteDiscordWebhook(user_id)
        .then((webhook_removed) => {
          if (webhook_removed) {
            res.send("Discord webhook removed");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("Webhook does not exist for user to remove");
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
};

/**
 * Get a discord webhook for a user
 * @param req The request object. It should contain a user Id in the request body
 * @param res The response object
 */
export const get_discord_webhook = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  if (typeof user_id === "number") {
    if (req.user !== undefined && req.user.Id === user_id) {
      getDiscordWebhookWithUserId(user_id)
        .then((discord_webhook) => {
          if (discord_webhook === null) {
            res.status(BAD_REQUEST_CODE).json(null);
          } else {
            res.json({ Webhook: discord_webhook });
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
    res.status(BAD_REQUEST_CODE).send(USER_ID_MISSING_MSG);
  }
};

/**
 * Update a discord webhook for a user
 * @param req The request object. It should contain a UserId and Webhook in the request body
 * @param res The response object
 */
export const update_discord_webhook = async (req: Request, res: Response) => {
  const user_id = req.body["UserId"];
  const discord_webhook = req.body["Webhook"];
  if (typeof user_id === "number" && typeof discord_webhook === "string") {
    if (req.user !== undefined && req.user.Id === user_id) {
      const discord_webhook_trimmed = (discord_webhook as string).trim();
      updateDiscordWebhook(user_id, discord_webhook_trimmed)
        .then((webhook_updated) => {
          if (webhook_updated) {
            res.send("Webhook updated for user");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("User does not have a webhook to update");
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
    res.status(BAD_REQUEST_CODE).send("Missing parameters");
  }
};
