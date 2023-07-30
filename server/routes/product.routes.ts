import express, { Router } from "express";
import {
  add_product,
  get_all_products,
  rename_product,
  delete_product,
} from "../controller/product.controllers";

// A router for product specific api calls
export const productRouter: Router = Router();

// Get all products that exist
productRouter.get("/", get_all_products);

// Used for creating a new product, should have a unique name supplied
productRouter.post("/", add_product);

// Used for renaming a product, with a new unique name
productRouter.patch("/:id", rename_product);

// Used for deleting a product
productRouter.delete("/:id", delete_product);
