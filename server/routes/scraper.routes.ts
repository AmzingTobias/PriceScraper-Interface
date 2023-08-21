import { verify_token, verify_token_is_admin } from "../common/security";
import { Router } from "express";
import { get_scraper_log } from "../controller/scraper.controller";

export const scraperRouter: Router = Router();

// Get the log for the price scraper
scraperRouter.use("/log", verify_token, get_scraper_log);
