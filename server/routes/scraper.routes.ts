import { verify_token } from "../common/security";
import { Router } from "express";
import { get_scraper_log, import_product } from "../controller/scraper.controller";
import { validate } from "../middleware/validate";
import { importProductSchema } from "../common/validation";

export const scraperRouter: Router = Router();

// Get the scraper log (admin only - checked in controller)
scraperRouter.get("/log", verify_token, get_scraper_log);

// Import a product from a URL
scraperRouter.post(
  "/import",
  verify_token,
  validate(importProductSchema),
  import_product
);
