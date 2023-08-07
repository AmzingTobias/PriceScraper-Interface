import { Router } from "express";
import {
  add_discord_webhook,
  get_discord_webhook,
  get_notification_setting_for_user,
  link_user_to_product_for_notification,
  remove_discord_webhook,
  remove_user_notification_for_product,
  set_notifications_settings,
  update_discord_webhook,
} from "../controller/notification.controller";
import { verify_token } from "../common/security";

export const notificationRouter = Router();

// Link a user to receive notifications for a given product
notificationRouter.post(
  "/link",
  verify_token,
  link_user_to_product_for_notification
);

// Remove the link between a user and a product to stop new notifications
notificationRouter.delete(
  "/link",
  verify_token,
  remove_user_notification_for_product
);

// Get a discord webhook for a user
notificationRouter.get("/discord", verify_token, get_discord_webhook);

// Add a discord webhook for a user
notificationRouter.post("/discord", verify_token, add_discord_webhook);

// Remove a discord webhook for a user
notificationRouter.delete("/discord", verify_token, remove_discord_webhook);

// Update a discord webhook for a user
notificationRouter.patch("/discord", verify_token, update_discord_webhook);

// Get the notification settings for a user
notificationRouter.get(
  "/user",
  verify_token,
  get_notification_setting_for_user
);

// Set the notification settings for a user
notificationRouter.post("/user", verify_token, set_notifications_settings);
