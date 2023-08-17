import { getDatabase } from "../data/database";
import sqlite3 from "sqlite3";

const db = getDatabase();

export type tUserNotificationSettings = {
  Enabled: boolean;
  NoPriceChangeEnabled: boolean;
};

/**
 * Get the notification settings for a user
 * @param user_id The user Id to use to lookup their notification settings
 * @returns A promise of the user's notification settings, or null if the user
 * doesn't exist or has no notification settings. Rejects on database errors
 */
export const getUserNotificationSettingsWithId = (
  user_id: number
): Promise<tUserNotificationSettings | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT Enabled AS `Enabled`, No_price_change_enabled AS `NoPriceChangeEnabled` FROM Notifications WHERE User_Id = ?",
      user_id,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(null);
          } else {
            resolve(row as tUserNotificationSettings);
          }
        }
      }
    );
  });
};

/**
 * Update the notification settings for a user
 * @param user_id The Id of the user to update the notification settings for
 * @param notification_settings The new settings for the notifications to update with
 * @returns A promise boolean, true if the notification settings are updated., false if the user
 * doesn't exist. Rejects on database errors
 */
export const updateNotificationSettingsWithUserId = (
  user_id: number,
  notification_settings: tUserNotificationSettings
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Notifications SET Enabled = ?, No_price_change_enabled = ? WHERE User_Id = ?",
      [
        notification_settings.Enabled ? 1 : 0,
        notification_settings.NoPriceChangeEnabled ? 1 : 0,
        user_id,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            // User does not exist
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Link a user to a product notification
 * @param user_id The Id of the user to link the notification for
 * @param product_id The Id of the product the user want to receive notifications for
 * @returns A promise boolean, if true the user has been linked to receive notifications for the
 * product. False if the product or user does not exist, or the user is already being
 * notified for the product. Rejects on database errors
 */
export const linkUserToProductForNotification = (
  user_id: number,
  product_id: number
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
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
              // Product or user does not exist
              resolve(false);
            } else {
              // User is already being notified for the product
              resolve(false);
            }
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            reject("Couldn't link user to product");
          }
        }
      }
    );
  });
};

/**
 * Unlink the user from receiving product notifications
 * @param user_id The Id of the user to unlink product notifcations for
 * @param product_id The Id of the product to unlink notifications for
 * @returns A promise boolean, true if the user has been unlined, false if
 * the user was never being notified for the product. Rejects on database errors
 */
export const unlinkUserFromProductNotification = (
  user_id: number,
  product_id: number
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM Product_notifications WHERE Product_Id = ? AND User_Id = ?",
      [product_id, user_id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            // User was never being notified for the product
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Create a discord webhook entry for a user
 * @param user_id The Id of the user to create the discord webhook for
 * @param discord_webhook The webhook to insert for the user
 * @returns A boolean promise, true if the discord webhook is inserted into
 * the database, false if the user already has a webhook, or the user doesn't exist. Rejects
 * on database errors
 */
export const createDiscordWebhook = (
  user_id: number,
  discord_webhook: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Discord_webhooks (User_Id, Discord_webhook) VALUES (?, ?)",
      [user_id, discord_webhook],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            if (
              err.message ===
              "SQLITE_CONSTRAINT: UNIQUE constraint failed: Discord_webhooks.User_Id"
            ) {
              // User already has a webhook
              resolve(false);
            } else {
              // User does not exist
              resolve(false);
            }
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            reject("Could not insert into database");
          }
        }
      }
    );
  });
};

/**
 * Update a discord webhook for a user
 * @param user_id The Id of the user to update their discord webhook
 * @param new_discord_webhook The new discord webhook to update for the user
 * @returns A promise boolean, true if the webhook is updated, false if the user
 * never had a webhook to update. Rejects on database errors
 */
export const updateDiscordWebhook = (
  user_id: number,
  new_discord_webhook: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Discord_webhooks SET Discord_webhook = ? WHERE User_Id = ?",
      [new_discord_webhook, user_id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            // User doesn't have a discord webhook to update
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Delete a discord webhook entry from the database
 * @param user_id The Id of the user to delete their discord webhook
 * @returns A promise boolean, true if the webhook is deleted, false otherwise. Rejects
 * on databaes errors
 */
export const deleteDiscordWebhook = (user_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM Discord_webhooks WHERE User_Id = ?",
      user_id,
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            // Webhook never existed to delete
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Get discord webhook for a user
 * @param user_id The Id of the user to get their discord webhook for
 * @returns A promise string or null. The discord webhook is returned if one
 * exists for the user, null if the user does not have a discord webhook. Rejects
 * on database errors
 */
export const getDiscordWebhookWithUserId = (
  user_id: number
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT Discord_webhook FROM Discord_webhooks WHERE User_Id = ?",
      user_id,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(null);
          } else {
            resolve((row as any).Discord_webhook);
          }
        }
      }
    );
  });
};

/**
 * Check to see if a user is being notified for a given product
 * @param user_Id The user Id to check for
 * @param product_id The product Id to check for
 * @returns A boolean promise, true if the user is assigned to receive notifications for a product. False otherwise.
 * Rejects on database errors
 */
export const isUserBeingNotifiedForProduct = (
  user_Id: number | string,
  product_id: number | string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT Id FROM Product_notifications WHERE Product_Id = ? AND User_Id = ?",
      [product_id, user_Id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      }
    );
  });
};
