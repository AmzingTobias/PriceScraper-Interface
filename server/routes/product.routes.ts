import express, { Router } from "express";
import {
  add_product,
  get_all_products,
  rename_product,
  delete_product,
} from "../controller/product.controllers";
import { verify_token } from "../common/security";

// A router for product specific api calls
export const productRouter: Router = Router();

// Get all products that exist
productRouter.get("/", get_all_products);

// Used for creating a new product, should have a unique name supplied
productRouter.post("/", verify_token, add_product);

// Used for renaming a product, with a new unique name
productRouter.patch("/:id", verify_token, rename_product);

// Used for deleting a product
productRouter.delete("/:id", verify_token, delete_product);
