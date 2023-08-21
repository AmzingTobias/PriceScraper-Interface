import { Request, Response } from "express";
import { isUserAdmin } from "../models/user.models";
import { UNAUTHORIZED_REQUEST_CODE } from "../common/status_codes";
import { getScraperConnection } from "../common/scraper";

/**
 * Get the log for the price scraper
 * @param req The request object. User must be an admin to access this request
 * @param res The response object
 */
export const get_scraper_log = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const priceScraper = getScraperConnection();
    res.json(priceScraper.programLogs);
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};
