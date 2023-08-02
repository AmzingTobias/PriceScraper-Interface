import { Request, Response } from "express";
import { getDatabase } from "../data/database";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} from "../common/status_codes";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import { IMAGE_ID_MISSING_MSG, IMAGE_LINK_MISSING_MSG } from "../common/image";
import sqlite3 from "sqlite3";

const db = getDatabase();

/**
 * Add a new image to the database
 * @param req The request object. It needs an Image url in the request body
 * @param res The response object
 */
export const add_image = async (req: Request, res: Response) => {
  const image_url = req.body["Image"];
  if (typeof image_url === "string") {
    const image_url_trimmed = image_url.trim();
    db.run(
      "INSERT INTO Images (Image_link) VALUES (?)",
      image_url_trimmed,
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            res
              .status(BAD_REQUEST_CODE)
              .send(`Image: ${image_url} already exists`);
          } else {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          }
        } else {
          if (this.changes > 0) {
            res.send(`Image: ${image_url_trimmed} added`);
          } else {
            res.send(`Image: ${image_url_trimmed} could not be added`);
          }
        }
      }
    );
  } else {
    res.status(BAD_REQUEST_CODE).send(IMAGE_LINK_MISSING_MSG);
  }
};

/**
 * Remove an image from the database
 * @param req The request object. It should have an image Id in the request parameters
 * @param res The response object
 */
export const remove_image = async (req: Request, res: Response) => {
  const image_id = req.params.Id;
  if (typeof image_id === "undefined") {
    res
      .status(INTERNAL_SERVER_ERROR_CODE)
      .send("Image Id missing from request");
  } else {
    db.run("DELETE FROM Images WHERE Id = ?", image_id, function (err) {
      if (err) {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      } else {
        if (this.changes > 0) {
          res.send(`Image: ${image_id} deleted`);
        } else {
          res.send(
            `Image: ${image_id} could not be deleted because it does not exist`
          );
        }
      }
    });
  }
};

/**
 * Link a product to an existing image
 * @param req The request object. It should have both a product Id and Image Id in the request body
 * @param res The response object
 */
export const set_image_for_product = async (req: Request, res: Response) => {
  const product_id = req.body["ProductId"];
  const image_id = req.body["ImageId"];
  if (typeof product_id !== "undefined" && typeof image_id !== "undefined") {
    db.run(
      "UPDATE Products SET Image_Id = ? WHERE Id = ?",
      [image_id, product_id],
      function (err) {
        if (err) {
          const errorWithNumber = err as { errno?: number };
          if (errorWithNumber.errno === sqlite3.CONSTRAINT) {
            res
              .status(BAD_REQUEST_CODE)
              .send(`Image: ${image_id} does not exist`);
          } else {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          }
        } else {
          if (this.changes > 0) {
            res.send(`Product: ${product_id} linked to image: ${image_id}`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(`Product: ${product_id} does not exist`);
          }
        }
      }
    );
  } else if (typeof product_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(IMAGE_ID_MISSING_MSG);
  }
};

/**
 * Remove a product link to an image
 * @param req The request object. It should contain a product Id in the request body
 * @param res The response object
 */
export const remove_image_from_product = async (
  req: Request,
  res: Response
) => {
  const product_id = req.body["ProductId"];
  if (typeof product_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  } else {
    db.run(
      "UPDATE Products SET Image_Id = NULL WHERE Id = ?",
      product_id,
      function (err) {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          if (this.changes > 0) {
            res.send(
              `Product: ${product_id} no longer has an image attached to it`
            );
          } else {
            res.send(`Product: ${product_id} does not exist`);
          }
        }
      }
    );
  }
};

/**
 * Get an image for a product
 * @param req The request object. It should contain a ProductId in its body
 * @param res The response object
 */
export const get_image_for_product = async (req: Request, res: Response) => {
  const product_id = req.body["ProductId"];
  if (typeof product_id === "undefined") {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  } else {
    db.get(
      "SELECT Images.Id AS `Id`, Images.Image_link AS `Link` FROM Images JOIN Products ON Products.Image_Id = Images.Id WHERE Products.Id = ?",
      product_id,
      (err, row) => {
        if (err) {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        } else {
          res.json(row);
        }
      }
    );
  }
};

/**
 * Get links to all images that are currently stored in the database
 * @param req The request object
 * @param res The response object
 */
export const get_all_images = async (req: Request, res: Response) => {
  db.all(
    "SELECT Images.Id AS `Id`, Images.Image_link AS `Link` FROM Images",
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
