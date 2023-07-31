import { Router } from "express";
import {
  link_user_to_product_for_notification,
  remove_user_notification_for_product,
} from "../controller/notification.controller";

export const notificationRouter = Router();

notificationRouter.post("/link", link_user_to_product_for_notification);

notificationRouter.delete("/link", remove_user_notification_for_product);
