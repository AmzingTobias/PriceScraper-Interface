import { Request, Response } from "express";
import { getDatabase } from "../data/database";
import sqlite3 from "sqlite3";
import {
  PRODUCT_ID_MISSING_MSG,
  PRODUCT_NAME_INVALID_MSG,
  PRODUCT_NAME_MISSING_MSG,
  validate_product_name,
} from "../common/product";

const db = getDatabase();
const BAD_REQUEST_CODE: number = 400;
const INTERNAL_SERVER_ERROR_CODE: number = 500;

/**
 * Gets all the products found in the database
 * @param req The request object
 * @param res The response object
 */
export const get_all_products = async (req: Request, res: Response) => {
  db.all(`SELECT Id, Name FROM Products ORDER BY ID`, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
    } else {
      res.json(rows);
    }
  });
};

/**
 * Add a product to the database
 * @param req The request object, should contain a name (for the product) in the
 * body field of the request
 * @param res The response object
 */
export const add_product = async (req: Request, res: Response) => {
  const { name } = req.body;
  // Check name was passed through
  if (typeof name !== "undefined") {
    const [product_name_valid, product_name] = validate_product_name(name);
    if (product_name_valid) {
      db.run(
        `INSERT INTO Products (Name) VALUES (?)`,
        product_name,
        function (err) {
          if (err) {
            const errorWithNumber = err as { errno?: number };
            if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
              res
                .status(BAD_REQUEST_CODE)
                .send(`${product_name} already exists`);
            } else {
              console.error(err);
              res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
            }
          } else {
            if (this.changes > 0) {
              res.send(`${product_name} added`);
            } else {
              res.status(BAD_REQUEST_CODE).send("Could not add product");
            }
          }
        }
      );
    } else {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_INVALID_MSG);
    }
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_MISSING_MSG);
  }
};

/**
 * Rename an existing product in the database
 * @param req The request object, should contain an id in the parameters field,
 * and a name (for the product) in the request body
 * @param res The response object
 */
export const rename_product = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (typeof name !== "undefined" && typeof id !== "undefined") {
    const [product_name_valid, product_name] = validate_product_name(name);
    if (product_name_valid) {
      db.run(
        `UPDATE Products SET Name = ? WHERE Id = ?`,
        [product_name, id],
        function (err) {
          if (err) {
            const errorWithNumber = err as { errno?: number };
            if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
              res
                .status(BAD_REQUEST_CODE)
                .send(`${product_name} already exists`);
            } else {
              console.error(err);
              res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
            }
          } else {
            if (this.changes > 0) {
              res.send(`Product: ${id} renamed to: ${product_name}`);
            } else {
              res
                .status(BAD_REQUEST_CODE)
                .send(`Product: ${id} does not exist`);
            }
          }
        }
      );
    } else {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_INVALID_MSG);
    }
  } else if (typeof name === "undefined") {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_MISSING_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  }
};
