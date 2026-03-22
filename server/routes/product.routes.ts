import { Router } from "express";
import {
  add_product,
  get_all_products,
  rename_product,
  delete_product,
  get_product,
  change_product_description,
} from "../controller/product.controllers";
import { verify_token, verify_token_is_admin } from "../common/security";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  renameProductSchema,
  changeDescriptionSchema,
} from "../common/validation";

export const productRouter: Router = Router();

// Get all products (public)
productRouter.get("/", get_all_products);

// Get a single product (public)
productRouter.get("/:productId", get_product);

// Create a new product (admin only)
productRouter.post(
  "/",
  verify_token,
  verify_token_is_admin,
  validate(createProductSchema),
  add_product
);

// Rename a product
productRouter.patch(
  "/name/:id",
  verify_token,
  verify_token_is_admin,
  validate(renameProductSchema),
  rename_product
);

// Change a product's description
productRouter.patch(
  "/description/:id",
  verify_token,
  verify_token_is_admin,
  validate(changeDescriptionSchema),
  change_product_description
);

// Delete a product (admin only)
productRouter.delete("/:id", verify_token, verify_token_is_admin, delete_product);
