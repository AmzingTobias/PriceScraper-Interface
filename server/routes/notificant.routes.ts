import { Router } from "express";
import {
  add_discord_webhook,
  get_notification_setting_for_user,
  link_user_to_product_for_notification,
  remove_discord_webhook,
  remove_user_notification_for_product,
  set_notifications_settings,
} from "../controller/notification.controller";

export const notificationRouter = Router();

// Link a user to receive notifications for a given product
notificationRouter.post("/link", link_user_to_product_for_notification);

// Remove the link between a user and a product to stop new notifications
notificationRouter.delete("/link", remove_user_notification_for_product);

// Add a discord webhook for a user
notificationRouter.post("/discord", add_discord_webhook);

// Remove a discord webhook for a user
notificationRouter.delete("/discord", remove_discord_webhook);

// Get the notification settings for a user
notificationRouter.get("/user", get_notification_setting_for_user);

// Set the notification settings for a user
notificationRouter.post("/user", set_notifications_settings);