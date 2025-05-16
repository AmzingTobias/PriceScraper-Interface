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


/**
 * Import a product from a supported site
 * @param req The request object, should contain a name (for the product) in the
 * body field of the request
 * @param res The response object
 */
export const import_product = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { import_link } = req.body;
    // Check name was passed through
    if (typeof import_link !== "undefined" && typeof import_link == "string") {
      const priceScraper = getScraperConnection();
      priceScraper.importSiteToScraper(import_link);
      res.status(200).send("Site requested for import, check logs for status");
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};