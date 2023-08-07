import { getDatabase } from "../data/database";

const db = getDatabase();

type tPriceEntry = {
  Price: number;
  Date: string;
  Site_link: string;
};

/**
 * Get a price entry for a product, using a date
 * @param product_id The Id of the product
 * @param date The date to get the price for
 * @returns A promise for a price entry if one exists, or undefined if one
 * doesn't exist. Rejected on database error
 */
export const getPriceForProductWithDate = (
  product_id: number,
  date: string
): Promise<tPriceEntry | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT Prices.Price, Prices.Date, Sources.Site_link
    FROM Prices
    JOIN Products ON Prices.Product_Id = Products.Id
    JOIN Sources ON Prices.Site_Id = Sources.Id
    WHERE Products.Id = ? AND Prices.Date = ?;`,
      [product_id, date],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(undefined);
          } else {
            resolve(row as tPriceEntry);
          }
        }
      }
    );
  });
};

/**
 * Get all prices for a product
 * @param product_id The product Id to get the prices for
 * @returns A promise with a list of price entries, or no entries if the product
 * has no prices, or does not exist. Rejects on any database errors
 */
export const getAllPricesWithProductId = (
  product_id: number
): Promise<tPriceEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT Prices.Price, Prices.Date, Sources.Site_link
      FROM Prices
      JOIN Products ON Prices.Product_Id = Products.Id
      JOIN Sources ON Prices.Site_Id = Sources.Id
      WHERE Products.Id = ?;`,
      product_id,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows === undefined) {
            resolve([]);
          } else {
            resolve(rows as tPriceEntry[]);
          }
        }
      }
    );
  });
};

/**
 * Get the lowest price found for a product
 * @param product_id The product Id to get the lowest price for
 * @returns Resolves with a price entry of the lowest price found, or undefined if the product doesn't
 * exist, or has no prices to show. Rejects on database errors
 */
export const getLowestPriceWithProductId = (
  product_id: number
): Promise<tPriceEntry | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT MIN(Prices.Price), Prices.Price, Prices.Date, Sources.Site_link
      FROM Prices
      JOIN Products ON Prices.Product_Id = Products.Id
      JOIN Sources ON Prices.Site_Id = Sources.Id
      WHERE Products.Id = ?;`,
      product_id,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(undefined);
          } else {
            resolve(row as tPriceEntry);
          }
        }
      }
    );
  });
};
