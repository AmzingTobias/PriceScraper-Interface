import { Request, Response } from "express";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  UNAUTHORIZED_REQUEST_CODE,
} from "../common/status_codes";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
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
  isUserBeingNotifiedForProduct,
  linkUserToProductForNotification,
  unlinkUserFromProductNotification,
  updateDiscordWebhook,
  updateNotificationSettingsWithUserId,
} from "../models/notification.models";

/**
 * Get the notification settings for a user
 * @param req The request object
 * @param res The response object
 */
export const get_notification_setting_for_user = async (
  req: Request,
  res: Response
) => {
  if (req.user !== undefined) {
    getUserNotificationSettingsWithId(req.user.Id)
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
};

/**
 * Set the notification settings for a user
 * @param req The request object, containing if notifications are enabled for the user, and also if notifications
 * should be received, if there is no price change detected for products
 * @param res The response object
 */
export const update_notifications_settings = async (
  req: Request,
  res: Response
) => {
  const enable_notifications = req.body["Enable"];
  const enable_no_price_change_notifications = req.body["NoPriceChangeEnable"];
  if (
    typeof enable_notifications === "boolean" &&
    typeof enable_no_price_change_notifications === "boolean"
  ) {
    // Only the user the request is for can update their notification settings
    if (req.user !== undefined) {
      updateNotificationSettingsWithUserId(req.user.Id, {
        Enabled: enable_notifications,
        NoPriceChangeEnabled: enable_no_price_change_notifications,
      })
        .then((settings_updated) => {
          if (settings_updated) {
            res.send("Settings updated for user");
          } else {
            res.status(BAD_REQUEST_CODE).send("User doesn't exist");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
    }
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
 * @param req The request object, should contain both a ProductId in the
 * request body
 * @param res The response object
 */
export const link_user_to_product_for_notification = async (
  req: Request,
  res: Response
) => {
  const product_id = req.body["ProductId"];
  if (typeof product_id === "number") {
    if (req.user !== undefined) {
      linkUserToProductForNotification(req.user.Id, product_id)
        .then((user_linked) => {
          if (user_linked) {
            res.send(`User linked to product: ${product_id}`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(
                "Product does not exist, or user is aready receiving notifications for product"
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
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  }
};

/**
 * Remvoe a link between a user and product, so that they no longer receive notifications for the product
 * @param req The request object, should contain both a ProductId in the request body
 * @param res The response object
 */
export const remove_user_notification_for_product = async (
  req: Request,
  res: Response
) => {
  const product_id = req.body["ProductId"];
  if (typeof product_id === "number") {
    // Only the user that is removing their notifications for the product can make this request
    if (req.user !== undefined) {
      unlinkUserFromProductNotification(req.user.Id, product_id)
        .then((unlinked_notification) => {
          if (unlinked_notification) {
            res.send(
              `User no longer receiving notifications for product: ${product_id}`
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
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  }
};

/**
 * Add a discord webhook for a user, so they can receive discord webhook notifications
 * @param req The request object. It should contain a Webhook in the request body
 * @param res The response object
 */
export const add_discord_webhook = async (req: Request, res: Response) => {
  const discord_webhook = req.body["Webhook"];
  if (typeof discord_webhook === "string") {
    if (req.user !== undefined) {
      const discord_webhook_trimmed = (discord_webhook as string).trim();
      createDiscordWebhook(req.user.Id, discord_webhook_trimmed)
        .then((webhook_created) => {
          if (webhook_created) {
            res.send("Discord webhook created for user");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("Disord webhook already exists for user");
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
    res.status(BAD_REQUEST_CODE).send(DISCORD_wEBHOOK_MISSING_MSG);
  }
};

/**
 * Remove a discord webhook for a user
 * @param req The request object
 * @param res The response objectt
 */
export const remove_discord_webhook = async (req: Request, res: Response) => {
  if (req.user !== undefined) {
    deleteDiscordWebhook(req.user.Id)
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
};

/**
 * Get a discord webhook for a user
 * @param req The request object
 * @param res The response object
 */
export const get_discord_webhook = async (req: Request, res: Response) => {
  if (req.user !== undefined) {
    getDiscordWebhookWithUserId(req.user.Id)
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
};

/**
 * Update a discord webhook for a user
 * @param req The request object. It should contain a Webhook in the request body
 * @param res The response object
 */
export const update_discord_webhook = async (req: Request, res: Response) => {
  const discord_webhook = req.body["Webhook"];
  if (typeof discord_webhook === "string") {
    if (req.user !== undefined) {
      const discord_webhook_trimmed = (discord_webhook as string).trim();
      updateDiscordWebhook(req.user.Id, discord_webhook_trimmed)
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
    res.status(BAD_REQUEST_CODE).send("Missing webhook");
  }
};

/**
 * Check if a user is being notified for a product
 * @param req The request object. Should have a productId in the params
 * @param res The response object
 */
export const is_user_notified_for_product = async (
  req: Request,
  res: Response
) => {
  if (req.user !== undefined) {
    const { productId } = req.params;
    if (productId !== undefined) {
      isUserBeingNotifiedForProduct(req.user.Id, productId)
        .then((notified) => {
          res.json(notified);
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};
