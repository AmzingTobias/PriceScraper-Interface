import { Request, Response } from "express";
import { getDatabase } from "../data/database";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import { SITE_ID_MISSING_MSG, SITE_LINK_MISSING_MSG } from "../common/site";
import sqlite3 from "sqlite3";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} from "../common/status_codes";

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

/**
 * Check the request to either get all sites in the database, or if a
 * ProductId field exists in the query params, get all sites for a specific
 * product
 * @param req The request object, containing both a site link and product id in the request body
 * @param res The response object
 */
export const add_site = async (req: Request, res: Response) => {
  const site_link = req.body["Site Link"];
  const product_id = req.body["ProductId"];
  if (typeof site_link !== "undefined" && typeof product_id !== "undefined") {
    db.run(
      `INSERT INTO Sources (Product_Id, Site_link) Values (?, ?)`,
      [product_id, site_link],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            if (
              err.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
            ) {
              res
                .status(BAD_REQUEST_CODE)
                .send(`Product: ${product_id} does not exist`);
            } else {
              res
                .status(BAD_REQUEST_CODE)
                .send(`${site_link} already linked to product: ${product_id}`);
            }
          } else {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          }
        } else {
          if (this.changes > 0) {
            res.send(`${site_link} added for product: ${product_id}`);
          } else {
            res.send(
              `${site_link} could not be added for product: ${product_id}`
            );
          }
        }
      }
    );
  } else if (typeof site_link !== "undefined") {
    res.status(BAD_REQUEST_CODE).send(SITE_LINK_MISSING_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  }
};

/**
 * Get a site using the site Id from the database
 * @param req The request object, containing a site id in its parameters
 * @param res The response object
 */
export const get_site_with_id = async (req: Request, res: Response) => {
  const { site_id } = req.params;
  if (typeof site_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(SITE_ID_MISSING_MSG);
  } else {
    db.get(
      `SELECT Id, Site_link AS 'Site Link', Product_Id AS 'Product Id'
    FROM Sources WHERE Id = ?`,
      site_id,
      (err, row) => {
        if (err) {
          console.error(err);
          res.status(BAD_REQUEST_CODE).send("Database error");
        } else {
          res.json(row);
        }
      }
    );
  }
};

/**
 * Remove a site from the database, using the site Id
 * @param req The request object, containing a site id in its parameters
 * @param res The response object
 */
export const remove_site = async (req: Request, res: Response) => {
  const { site_id } = req.params;
  if (typeof site_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(SITE_ID_MISSING_MSG);
  } else {
    db.run(`DELETE FROM Sources WHERE Id = ?`, site_id, function (err) {
      if (err) {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      } else {
        if (this.changes > 0) {
          res.send(`Site: ${site_id} deleted`);
        } else {
          res.send(
            `Site: ${site_id} couldn't be deleted, because it does not exist`
          );
        }
      }
    });
  }
};

export const rename_site = (req: Request, res: Response) => {
  const { site_id } = req.params;
  const new_site_link = req.body["Site Link"];
  if (typeof site_id !== "undefined" && typeof new_site_link !== "undefined") {
    db.run(
      `UPDATE Sources SET Site_link = ? WHERE Id = ?`,
      [new_site_link, site_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            res
              .status(BAD_REQUEST_CODE)
              .send(`${new_site_link} is already linked to this product`);
          } else {
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
            console.error(err);
          }
        } else {
          if (this.changes > 0) {
            res.send(`Site: ${site_id} link updated to: ${new_site_link}`);
          } else {
            res.send(
              `Site: ${site_id} could not be updated, because it does not exist`
            );
          }
        }
      }
    );
  }
};
