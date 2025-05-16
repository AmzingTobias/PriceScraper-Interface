import { Router } from "express";
import {
  add_image,
  get_all_images,
  get_image_for_product,
  get_image_with_id,
  remove_image,
  remove_image_from_product,
  set_image_for_product,
} from "../controller/image.controller";
import { verify_token, verify_token_is_admin } from "../common/security";
import { v4 as uuidv4 } from 'uuid';
export const imageRouter = Router();

import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const filename = uuidv4();
    cb(
      null,
      filename + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
// Get all images from the database
imageRouter.get("/", verify_token, get_all_images);

// Get an image with Id
imageRouter.get("/:id", verify_token, get_image_with_id);

// Add a new image to the database
imageRouter.post(
  "/",
  verify_token,
  verify_token_is_admin,
  upload.single("image"),
  add_image
);

// Get an image for a given product
imageRouter.get("/product/:productId", get_image_for_product);

// Delete a link between a product and an image
imageRouter.delete(
  "/product/:productId",
  verify_token,
  remove_image_from_product
);

// Set an image for a product
imageRouter.patch("/product/:productId", verify_token, set_image_for_product);

// Delete an image from the database
imageRouter.delete("/:Id", verify_token, remove_image);
