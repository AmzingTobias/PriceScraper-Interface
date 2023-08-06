import { Request, Response } from "express";
import { MISSING_DATE_MSG, date_string_to_date } from "../common/date";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} from "../common/status_codes";
import {
  getAllPricesWithProductId,
  getLowestPriceWithProductId,
  getPriceForProductWithDate,
} from "../models/price.models";

type tProductPrice = {
  Price: number;
  Date: string | Date;
  Site_link: string;
};

/**
 * Gets all prices at a given date for a product
 * @param req The request object, should contain a product id in the request
 * parameter, and a date in the format dd-mm-yyyy in the request query
 * @param res The response object
 */
const get_price_at_date_for_product = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const { date } = req.query;
  if (typeof product_id === "string" && typeof date === "string") {
    getPriceForProductWithDate(Number(product_id), date)
      .then((price_entry) => {
        if (price_entry === undefined) {
          res.json({});
        } else {
          const data_received: tProductPrice = {
            Price: price_entry.Price,
            Date: date_string_to_date(price_entry.Date),
            Site_link: price_entry.Site_link,
          };
          res.json(data_received);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  } else if (typeof date === "undefined") {
    res.status(BAD_REQUEST_CODE).send(MISSING_DATE_MSG);
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  }
};

/**
 * Gets all prices for a product
 * @param req The request object, should contain a product id in the request parameter
 * @param res The response object
 */
const get_all_prices_for_product = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  if (typeof product_id !== "undefined") {
    getAllPricesWithProductId(Number(product_id))
      .then((price_entries) => {
        res.json(price_entries);
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  }
};

/**
 * Get either the price for a product on a given date, or get all prices for a product
 * @param req The request object, should contain a product id in the request parameter,
 * if a date field exists in the query then it will get the prices for the product at that date
 * @param res The response object
 */
export const get_product_price = async (req: Request, res: Response) => {
  // Check to see if a date was passed in as a parameter
  if (typeof req.query.date === "undefined") {
    get_all_prices_for_product(req, res);
  } else {
    get_price_at_date_for_product(req, res);
  }
};

/**
 * Get the lowest price found for a product
 * @param req The request object, should contain a product id in the request parameter
 * @param res The response object
 */
export const get_lowest_price_for_product = async (
  req: Request,
  res: Response
) => {
  const { product_id } = req.params;
  if (typeof product_id !== "undefined") {
    getLowestPriceWithProductId(Number(product_id))
      .then((price_entry) => {
        if (price_entry === undefined) {
          res.json({});
        } else {
          // Map the data received to then return as json
          const dataReceived: tProductPrice = {
            Price: price_entry.Price,
            Date: date_string_to_date(price_entry.Date),
            Site_link: price_entry.Site_link,
          };
          res.json(dataReceived);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  } else {
    res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
  }
};
