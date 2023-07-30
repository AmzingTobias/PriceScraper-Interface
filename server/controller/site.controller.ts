import { Request, Response } from "express";
import { getDatabase } from "../data/database";

const BAD_REQUEST_CODE = 200;
const INTERNAL_SERVER_ERROR_CODE = 500;

const db = getDatabase();

/**
 * Gets all sites that are used for scraping
 * @param req The request object
 * @param res The response object
 */
const get_all_sites = async (_req: Request, res: Response) => {
  db.all(
    `SELECT Id, Site_link AS 'Site Link', Product_Id AS 'Product Id' FROM Sources`,
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      } else {
        res.json(rows);
      }
    }
  );
};

/**
 * Get all sites for a given product
 * @param _req
 * @param res The response object
 * @param product_id The product Id to get the sites for
 */
const get_all_sites_for_product = async (
  _req: Request,
  res: Response,
  product_id: string
) => {
  db.all(
    `SELECT Id, Site_link AS 'Site Link', Product_Id AS 'Product Id' 
    FROM Sources WHERE Product_Id = ?`,
    product_id,
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      } else {
        res.json(rows);
      }
    }
  );
};

/**
 * Check the request to either get all sites in the database, or if a
 * ProductId field exists in the query params, get all sites for a specific
 * product
 * @param req The request object
 * @param res The response object
 */
export const get_sites = async (req: Request, res: Response) => {
  const product_id = req.query.ProductId;
  if (typeof product_id === "undefined") {
    get_all_sites(req, res);
  } else if (typeof product_id === "string") {
    get_all_sites_for_product(req, res, product_id as string);
  } else {
    res.status(BAD_REQUEST_CODE);
  }
};
