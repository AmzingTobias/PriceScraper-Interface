import { Request, Response } from "express";
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
  getImageWithId,
  getImageWithProductId,
  linkProductToImage,
  unlinkProductFromImage,
} from "../models/image.models";
import { isUserAdmin } from "../models/user.models";
import path from "path";
import fs from "fs";

/**
 * Add a new image to the database
 * @param req The request object. It needs an Image url in the request body
 * @param res The response object
 */
export const add_image = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    if (req.file !== undefined) {
      addImage(`/uploads/${req.file?.filename}`)
        .then((image_added) => {
          if (image_added[0]) {
            res.send(`Image added`);
          } else {
            res.status(BAD_REQUEST_CODE).send(`Image already exists`);
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
      getImageWithId(image_id).then((imageToDelete) => {
        if (imageToDelete !== null) {
          const filepath = path.join(__dirname, "../", imageToDelete.Link);
          fs.unlink(filepath, (err) => {
            if (err) {
              console.error(err);
              res
                .status(INTERNAL_SERVER_ERROR_CODE)
                .send("Error removing image");
            } else {
              deleteImage(Number(image_id))
                .then((image_deleted) => {
                  if (image_deleted) {
                    res.send("Image deleted");
                  } else {
                    res
                      .status(BAD_REQUEST_CODE)
                      .send(
                        "Image could not be deleted, because it does not exist"
                      );
                  }
                })
                .catch((err) => {
                  console.error(err);
                  res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
                });
            }
          });
        }
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
    const { productId } = req.params;
    const image_id = req.body["ImageId"];
    if (typeof productId === "number" && typeof image_id === "number") {
      linkProductToImage(image_id, productId)
        .then((linked) => {
          if (linked) {
            res.send(`Product: ${productId} linked to image: ${image_id}`);
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
    } else if (typeof productId !== "number") {
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
    const { productId } = req.params;
    if (typeof productId === "undefined") {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
    } else {
      unlinkProductFromImage(Number(productId))
        .then((unlinked) => {
          if (unlinked) {
            res.send(`Product: ${productId} unlinked from image`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(`Product: ${productId} does not exist`);
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
  const { productId } = req.params;
  if (typeof productId === "undefined") {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  } else {
    getImageWithProductId(Number(productId))
      .then((image_entry) => {
        if (image_entry === null) {
          res.json(null);
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
