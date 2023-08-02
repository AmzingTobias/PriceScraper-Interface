import { Router } from "express";
import {
  add_image,
  get_all_images,
  get_image_for_product,
  remove_image,
  remove_image_from_product,
  set_image_for_product,
} from "../controller/image.controller";

export const imageRouter = Router();

// Get all images from the database
imageRouter.get("/", get_all_images);

// Add a new image to the database
imageRouter.post("/", add_image);

// Get an image for a given product
imageRouter.get("/product", get_image_for_product);

// Delete a link between a product and an image
imageRouter.delete("/product", remove_image_from_product);

// Set an image for a product
imageRouter.patch("/product", set_image_for_product);

// Delete an image from the database
imageRouter.delete("/:Id", remove_image);
