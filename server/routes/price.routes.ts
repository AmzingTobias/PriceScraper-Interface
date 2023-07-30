import express, { Router } from "express";
import {
  get_lowest_price_for_product,
  get_product_price,
} from "../controller/prices.controller";

// A router for price specific api calls
export const priceRouter: Router = Router();

// Get a price for a given product
priceRouter.get("/:product_id", get_product_price);

// Get the lowest price found for a given product
priceRouter.get("/:product_id/lowest", get_lowest_price_for_product);
