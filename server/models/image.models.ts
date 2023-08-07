import sqlite3 from "sqlite3";
import { getDatabase } from "../data/database";

type tImageEntry = {
  Id: number;
  Link: string;
};

const db = getDatabase();

/**
 * Add an image to the database
 * @param image_url The image url to add to the database
 * @returns A promise boolean, resolves with true if the image is added to
 * the database, false if the image url is already in the database. Rejects on
 * database errors
 */
export const addImage = (image_url: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO Images (Image_link) VALUES (?)",
      image_url,
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
            reject("Could not add image to database");
          }
        }
      }
    );
  });
};

/**
 * Delete an image from the database
 * @param image_id The Id of the image to delete
 * @returns A promise boolean, resolves true if the image has been deleted, false if the
 * image did not exist to delete. Rejects on database errors
 */
export const deleteImage = (image_id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM Images WHERE Id = ?", image_id, function (err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
};

/**
 * Create a link between an image and a product
 * @param image_id The image Id to use for linking
 * @param product_id The Id of the product to link the image to
 * @returns A promise boolean, true if the product is linked to the image, false if either
 * the product or image does not exist. Rejects on database errors
 */
export const linkProductToImage = (
  image_id: number,
  product_id: number
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Products SET Image_Id = ? WHERE Id = ?",
      [image_id, product_id],
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
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Unlink a product from an image
 * @param product_id The product Id to unlink the image from
 * @returns A promise boolean, true if the product is unlinked from it's image,
 * false if the product doesn't exist. Rejects on database errors
 */
export const unlinkProductFromImage = (
  product_id: number
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE Products SET Image_Id = NULL Where Id = ?",
      product_id,
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });
};

/**
 * Get an image that is assigned to a product
 * @param product_id The Id of the product to get the image for
 * @returns A promise of an image entry, or null if no image exists. Rejects on database errors
 */
export const getImageWithProductId = (
  product_id: number
): Promise<tImageEntry | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT Images.Id AS `Id`, Images.Image_link AS `Link` FROM Images JOIN Products ON Products.Image_Id = Images.Id WHERE Products.Id = ?",
      product_id,
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row === undefined) {
            resolve(null);
          } else {
            resolve(row as tImageEntry);
          }
        }
      }
    );
  });
};

/**
 * Get all images stored in the database
 * @returns A promise for a list of all image entries, the list is empty if no images exist.
 * Rejects on database erros
 */
export const getAllImages = (): Promise<tImageEntry[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT Images.Id AS `Id`, Images.Image_link AS `Link` FROM Images",
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows.length === 0) {
            resolve([]);
          } else {
            resolve(rows as tImageEntry[]);
          }
        }
      }
    );
  });
};
