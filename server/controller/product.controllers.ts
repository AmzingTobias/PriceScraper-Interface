import { Request, Response } from "express";
import {
  PRODUCT_ID_MISSING_MSG,
  PRODUCT_NAME_INVALID_MSG,
  PRODUCT_NAME_MISSING_MSG,
  validate_product_name,
} from "../common/product";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  UNAUTHORIZED_REQUEST_CODE,
} from "../common/status_codes";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductWithId,
  renameProductWithId,
} from "../models/product.models";
import { isUserAdmin } from "../models/user.models";

/**
 * Get a single product from the database
 * @param req The request object. Should contain a product Id in it's params
 * @param res The response object
 */
export const get_product = async (req: Request, res: Response) => {
  const { productId } = req.params;
  getProductWithId(productId)
    .then((product) => {
      if (product === null) {
        res.status(BAD_REQUEST_CODE).json(null);
      } else {
        res.json(product);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
    });
};

/**
 * Gets all the products found in the database
 * @param req The request object
 * @param res The response object
 */
export const get_all_products = async (req: Request, res: Response) => {
  getAllProducts()
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
    });
};

/**
 * Add a product to the database
 * @param req The request object, should contain a name (for the product) in the
 * body field of the request
 * @param res The response object
 */
export const add_product = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { name } = req.body;
    // Check name was passed through
    if (typeof name !== "undefined") {
      const [product_name_valid, product_name] = validate_product_name(name);
      if (product_name_valid) {
        createProduct(product_name)
          .then((product_created) => {
            if (product_created) {
              res.send(`Product: ${product_name} created`);
            } else {
              res
                .status(BAD_REQUEST_CODE)
                .send(`Product: ${product_name} already exists`);
            }
          })
          .catch((err) => {
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          });
      } else {
        res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_INVALID_MSG);
      }
    } else {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_MISSING_MSG);
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};

/**
 * Rename an existing product in the database
 * @param req The request object, should contain an id in the parameters field,
 * and a name (for the product) in the request body
 * @param res The response object
 */
export const rename_product = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { id } = req.params;
    const { name } = req.body;
    if (typeof name !== "undefined" && typeof id !== "undefined") {
      const [product_name_valid, product_name] = validate_product_name(name);
      if (product_name_valid) {
        renameProductWithId(Number(id), product_name)
          .then((product_renamed) => {
            if (product_renamed) {
              res.send(`Product: ${id} renamed to ${product_name}`);
            } else {
              res
                .status(BAD_REQUEST_CODE)
                .send("Product doesn't exist, or product name already in use");
            }
          })
          .catch((err) => {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
          });
      } else {
        res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_INVALID_MSG);
      }
    } else if (typeof name === "undefined") {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_NAME_MISSING_MSG);
    } else {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};

/**
 * Delete an existing product from the database
 * @param req The request object, should contain an id in the parameters field,
 * @param res The response object
 */
export const delete_product = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { id } = req.params;
    // Validate product_id was included in the request
    if (typeof id !== "undefined") {
      deleteProduct(Number(id))
        .then((product_deleted) => {
          if (product_deleted) {
            res.send(`Product deleted`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("Product does not exist to delete");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};
