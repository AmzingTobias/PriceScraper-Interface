import { Request, Response } from "express";
import { getDatabase } from "../data/database";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  UNAUTHORIZED_REQUEST_CODE,
} from "../common/status_codes";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import { IMAGE_ID_MISSING_MSG, IMAGE_LINK_MISSING_MSG } from "../common/image";
import {
  addImage,
  deleteImage,
  getAllImages,
  getImageWithProductId,
  linkProductToImage,
  unlinkProductFromImage,
} from "../models/image.models";
import { isUserAdmin } from "../models/user.models";

const db = getDatabase();

/**
 * Add a new image to the database
 * @param req The request object. It needs an Image url in the request body
 * @param res The response object
 */
export const add_image = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const image_url = req.body["Image"];
    if (typeof image_url === "string") {
      const image_url_trimmed = image_url.trim();
      addImage(image_url_trimmed)
        .then((image_added) => {
          if (image_added) {
            res.send(`Image: ${image_url_trimmed} added`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(`Image: ${image_url_trimmed} already exists`);
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(BAD_REQUEST_CODE).send(IMAGE_LINK_MISSING_MSG);
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};

/**
 * Remove an image from the database
 * @param req The request object. It should have an image Id in the request parameters
 * @param res The response object
 */
export const remove_image = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const image_id = req.params.Id;
    if (typeof image_id === "undefined") {
      res
        .status(INTERNAL_SERVER_ERROR_CODE)
        .send("Image Id missing from request");
    } else {
      deleteImage(Number(image_id))
        .then((image_deleted) => {
          if (image_deleted) {
            res.send("Image deleted");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("Image could not be deleted, because it does not exist");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};

/**
 * Link a product to an existing image
 * @param req The request object. It should have both a product Id and Image Id in the request body
 * @param res The response object
 */
export const set_image_for_product = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const product_id = req.body["ProductId"];
    const image_id = req.body["ImageId"];
    if (typeof product_id === "number" && typeof image_id === "number") {
      linkProductToImage(image_id, product_id)
        .then((linked) => {
          if (linked) {
            res.send(`Product: ${product_id} linked to image: ${image_id}`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("Image or Product does not exist");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else if (typeof product_id !== "number") {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
    } else {
      res.status(BAD_REQUEST_CODE).send(IMAGE_ID_MISSING_MSG);
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
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
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const product_id = req.body["ProductId"];
    if (typeof product_id === "undefined") {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
    } else {
      unlinkProductFromImage(product_id)
        .then((unlinked) => {
          if (unlinked) {
            res.send(`Product: ${product_id} unlinked from image`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(`Product: ${product_id} does not exist`);
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
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
    getImageWithProductId(product_id)
      .then((image_entry) => {
        if (image_entry === null) {
          res.json({});
        } else {
          res.json(image_entry);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  }
};

/**
 * Get links to all images that are currently stored in the database
 * @param req The request object
 * @param res The response object
 */
export const get_all_images = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    getAllImages()
      .then((image_entries) => {
        res.json(image_entries);
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};
