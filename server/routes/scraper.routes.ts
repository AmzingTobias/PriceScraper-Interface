import { verify_token } from "../common/security";
import { Router } from "express";
import { get_scraper_log, import_product } from "../controller/scraper.controller";

export const scraperRouter: Router = Router();

// Get the log for the price scraper
scraperRouter.use("/log", verify_token, get_scraper_log);

scraperRouter.use("/import", verify_token, import_product);
