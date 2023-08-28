import sqlite3 from "sqlite3";
import { getDatabase } from "../data/database";

const db = getDatabase();

export type tSiteEntry = {
  Id: number;
  Link: string;
  ProductId: number;
};

/**
 * Get all sites that exist in the database
 * @returns A promise for a list of all sites in the database. Rejects on database
 * errors
 */
export const getAllSites = (): Promise<tSiteEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT Id, Site_link AS 'Link', Product_Id AS 'ProductId' FROM Sources`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows.length === 0) {
            resolve([]);
          } else {
            resolve(rows as tSiteEntry[]);
          }
        }
      }
    );
  });
};

/**
 * Get a list of all sites using a product Id
 * @param product_id The Id of the product to get the sites for
 * @returns A promise for a list of all sites that are associated with the
 * product. Rejects on database errors
 */
export const getAllSitesForProductWithId = (
  product_id: number
): Promise<tSiteEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT Id, Site_link AS 'Link', Product_Id AS 'ProductId'
      FROM Sources WHERE Product_Id = ?`,
      product_id,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows.length === 0) {
            resolve([]);
          } else {
            resolve(rows as tSiteEntry[]);
          }
        }
      }
    );
  });
};

/**
 * Create a site for a product
 * @param site_link The site link for the product
 * @param product_id The product Id the site link is for
 * @returns A promise boolean, true if the site is created. False if the site
 * is not created because the product does not exist, or the product already has
 * this site associated to it. Rejects on database errors
 */
export const createSite = (
  site_link: string,
  product_id: number
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Sources (Product_Id, Site_link) VALUES (?, ?)",
      [product_id, site_link],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            if (
              err.message === "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
            ) {
              // Product does not exist
              resolve(false);
            } else {
              // Product already has this site linked
              resolve(false);
            }
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            reject("Could not create site");
          }
        }
      }
    );
  });
};

/**
 * Get a site from the database
 * @param site_id The Id of the site to get
 * @returns A promise of a site entry if a site exists, or null if the site
 * doesn't exist. Rejects on database errors
 */
export const getSiteWithId = (site_id: number): Promise<tSiteEntry | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT Id, Site_link AS 'Link', Product_Id AS 'ProductId' FROM Sources WHERE Id = ?`,
      site_id,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(null);
          } else {
            resolve(row as tSiteEntry);
          }
        }
      }
    );
  });
};

/**
 * Delete a site from the database
 * @param site_id The Id of the site to delete
 * @returns A promise boolean. True if the site has been deleted, false
 * if the site couldn't be deleted, because it doesn't exist. Rejects on
 * database errors
 */
export const deleteSite = (site_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM Sources WHERE Id = ?`, site_id, function (err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes > 0) {
          resolve(true);
        } else {
          // Site never existed
          resolve(false);
        }
      }
    });
  });
};

/**
 * Rename a site that exists in the database
 * @param site_id The Id of the site to rename
 * @param new_site_link The new site link
 * @returns A promise boolean, true if the site has been renamed. False if
 * the site is already linked to the product, or the product doesn't exist.
 * Rejects on database errors
 */
export const renameSite = (
  site_id: number,
  new_site_link: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Sources SET Site_link = ? WHERE Id = ?",
      [new_site_link, site_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            // Site is already linked to product
            resolve(false);
          } else {
            reject(err);
          }
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            // Site doesn't exist so couldn't be updated
            resolve(false);
          }
        }
      }
    );
  });
};
