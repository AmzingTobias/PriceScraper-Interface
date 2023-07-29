import express, { Router } from "express";
import { get_product_price } from "../controller/prices.controller";

export const priceRouter: Router = Router();

priceRouter.get("/:product_name", get_product_price);
