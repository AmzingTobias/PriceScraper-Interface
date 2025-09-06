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

function validateImportLink(link: string): string | null {
  try {
    const url = new URL(link);

    // Only allow http/https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    // Block localhost/private networks (to prevent SSRF)
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.endsWith(".local")
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Import a product from a supported site
 * @param req The request object, should contain a name (for the product) in the
 * body field of the request
 * @param res The response object
 */
export const import_product = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { import_link } = req.body;

    if (typeof import_link === "string") {
      const safeLink = validateImportLink(import_link);

      if (!safeLink) {
        return res.status(400).send("Invalid link");
      }

      const priceScraper = getScraperConnection();
      priceScraper.importSiteToScraper(safeLink);
      return res
        .status(200)
        .send("Site requested for import, check logs for status");
    } else {
      return res.status(400).send("Missing import_link in request body");
    }
  } else {
    return res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};
