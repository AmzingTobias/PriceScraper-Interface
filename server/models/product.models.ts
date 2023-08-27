import sqlite3 from "sqlite3";
import { getDatabase } from "../data/database";

const db = getDatabase();

export type tProductEntry = {
  Id: number;
  Name: string;
  Description: string;
};

/**
 * Get a product
 * @param productId The Id of the product to get
 * @returns A promise with a product Id entry if one exists, or null if no product exists. Rejects
 * on database errors
 */
export const getProductWithId = (
  productId: string | number
): Promise<tProductEntry | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT Id, Name, Description FROM Products WHERE Id = ?",
      productId,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(null);
          } else {
            resolve(row as tProductEntry);
          }
        }
      }
    );
  });
};

/**
 * Get all products that exist in the database
 * @returns A promise for a list of all product entries in the database. Rejects on
 * any database errors
 */
export const getAllProducts = (): Promise<tProductEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT Id, Name FROM Products ORDER BY Id`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length === 0) {
          resolve([]);
        } else {
          resolve(rows as tProductEntry[]);
        }
      }
    });
  });
};

/**
 * Create a new product in the database
 * @param product_name The product name for the new product
 * @param product_description The product description, or null
 * @returns A boolean and number promise. True if the product is created, false
 * if the product already exists. The number represents the Id of the newly created product Rejects on database errors
 */
export const createProduct = (
  product_name: string,
  product_description: string | null
): Promise<[boolean, number]> => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Products (Name, Description) VALUES (?, ?)",
      [product_name, product_description],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            resolve([false, this.lastID]);
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve([true, this.lastID]);
          } else {
            reject("Couldn't create product");
          }
        }
      }
    );
  });
};

export const renameProductWithId = (
  product_id: number,
  new_product_name: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE Products SET Name = ? WHERE Id = ?`,
      [new_product_name, product_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            // Product name already exists
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            // Product doesn't exist to rename
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Change a products description with an Id
 * @param product_id The Id of the product to change the description for
 * @param new_description The description for the product
 * @returns A boolean promise, true if the description has been changed, false if the product doesn't exist.
 * Rejects on database errors
 */
export const changeProductDescriptionWithId = (
  product_id: number | string,
  new_description: string | null
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Products SET Description = ? WHERE Id = ?",
      [new_description, product_id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      }
    );
  });
};

/**
 * Delete a product from the database
 * @param product_id The Id of the product to delete
 * @returns A promise boolean, true if the product is deleted, false
 * if the product does not exist to delete. Rejected for database errors
 */
export const deleteProduct = (product_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM Products WHERE Id = ?", product_id, function (err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes > 0) {
          resolve(true);
        } else {
          // Product does not exist to delete
          resolve(false);
        }
      }
    });
  });
};
