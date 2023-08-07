import sqlite3 from "sqlite3";
import { getDatabase } from "../data/database";

const db = getDatabase();

type tProductEntry = {
  Id: number;
  Name: string;
};

/**
 * Get all products that exist in the database
 * @returns A promise for a list of all product entries in the database. Rejects on
 * any database errors
 */
export const getAllProducts = (): Promise<tProductEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT Id, Name FROM Products ORDER BY ID`, (err, rows) => {
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
 * @returns A boolean promise. True if the product is created, false
 * if the product already exists. Rejects on database errors
 */
export const createProduct = (product_name: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Products (Name) VALUES (?)",
      product_name,
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
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
