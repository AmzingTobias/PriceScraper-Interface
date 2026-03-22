import { Router } from "express";
import {
  add_discord_webhook,
  get_discord_webhook,
  get_notification_setting_for_user,
  is_user_notified_for_product,
  link_user_to_product_for_notification,
  remove_discord_webhook,
  remove_user_notification_for_product,
  update_notifications_settings,
  update_discord_webhook,
  get_products_user_notified_for,
} from "../controller/notification.controller";
import { verify_token } from "../common/security";
import { validate } from "../middleware/validate";
import {
  linkNotificationSchema,
  updateNotificationSettingsSchema,
  discordWebhookSchema,
} from "../common/validation";

export const notificationRouter = Router();

// Link a user to receive notifications for a product
notificationRouter.post(
  "/link",
  verify_token,
  validate(linkNotificationSchema),
  link_user_to_product_for_notification
);

// Remove the notification link
notificationRouter.delete(
  "/link",
  verify_token,
  validate(linkNotificationSchema),
  remove_user_notification_for_product
);

// Discord webhook CRUD
notificationRouter.get("/discord", verify_token, get_discord_webhook);
notificationRouter.post(
  "/discord",
  verify_token,
  validate(discordWebhookSchema),
  add_discord_webhook
);
notificationRouter.delete("/discord", verify_token, remove_discord_webhook);
notificationRouter.patch(
  "/discord",
  verify_token,
  validate(discordWebhookSchema),
  update_discord_webhook
);

// Notification settings
notificationRouter.get("/user", verify_token, get_notification_setting_for_user);
notificationRouter.patch(
  "/user",
  verify_token,
  validate(updateNotificationSettingsSchema),
  update_notifications_settings
);

// Products the user is notified for
notificationRouter.get("/user/product", verify_token, get_products_user_notified_for);

// Check if user is notified for a product
notificationRouter.get("/product/:productId", verify_token, is_user_notified_for_product);
