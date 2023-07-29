import express, { Router } from "express";
import {
  get_product,
  get_all_products,
} from "../controller/products.controllers";

export const productRouter: Router = Router();

productRouter.get("/", get_all_products);

productRouter.get("/:name", get_product);
