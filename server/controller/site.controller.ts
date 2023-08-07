import { Request, Response } from "express";
import { PRODUCT_ID_MISSING_MSG } from "../common/product";
import { SITE_ID_MISSING_MSG, SITE_LINK_MISSING_MSG } from "../common/site";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  UNAUTHORIZED_REQUEST_CODE,
} from "../common/status_codes";
import {
  createSite,
  deleteSite,
  getAllSites,
  getAllSitesForProductWithId,
  getSiteWithId,
  renameSite,
} from "../models/site.models";
import { isUserAdmin } from "../models/user.models";

/**
 * Gets all sites that are used for scraping
 * @param req The request object
 * @param res The response object
 */
const get_all_sites = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    getAllSites()
      .then((sites) => {
        res.json(sites);
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};

/**
 * Get all sites for a given product
 * @param _req
 * @param res The response object
 * @param product_id The product Id to get the sites for
 */
const get_all_sites_for_product = async (
  req: Request,
  res: Response,
  product_id: string
) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    getAllSitesForProductWithId(Number(product_id))
      .then((site_entries) => {
        res.json(site_entries);
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
      });
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};

/**
 * Check the request to either get all sites in the database, or if a
 * ProductId field exists in the query params, get all sites for a specific
 * product
 * @param req The request object
 * @param res The response object
 */
export const get_sites = async (req: Request, res: Response) => {
  const product_id = req.query.ProductId;
  if (typeof product_id === "undefined") {
    get_all_sites(req, res);
  } else if (typeof product_id === "string") {
    get_all_sites_for_product(req, res, product_id as string);
  } else {
    res.status(BAD_REQUEST_CODE);
  }
};

/**
 * Check the request to either get all sites in the database, or if a
 * ProductId field exists in the query params, get all sites for a specific
 * product
 * @param req The request object, containing both a site link and product id in the request body
 * @param res The response object
 */
export const add_site = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const site_link = req.body["Site Link"];
    const product_id = req.body["ProductId"];
    if (typeof site_link === "string" && typeof product_id === "number") {
      createSite(site_link.trim().toLowerCase(), product_id)
        .then((site_created) => {
          if (site_created) {
            res.send(`Site: ${site_link} added`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(
                "Product already has site linked or product does not exist"
              );
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else if (typeof site_link !== "string") {
      res.status(BAD_REQUEST_CODE).send(SITE_LINK_MISSING_MSG);
    } else {
      res.status(BAD_REQUEST_CODE).send(PRODUCT_ID_MISSING_MSG);
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};

/**
 * Get a site using the site Id from the database
 * @param req The request object, containing a site id in its parameters
 * @param res The response object
 */
export const get_site_with_id = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { site_id } = req.params;
    if (typeof site_id === "undefined") {
      res.status(BAD_REQUEST_CODE).send(SITE_ID_MISSING_MSG);
    } else {
      getSiteWithId(Number(site_id))
        .then((site_entry) => {
          if (site_entry === null) {
            res.status(BAD_REQUEST_CODE).json({});
          } else {
            res.json(site_entry);
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
 * Remove a site from the database, using the site Id
 * @param req The request object, containing a site id in its parameters
 * @param res The response object
 */
export const remove_site = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { site_id } = req.params;
    if (typeof site_id === "undefined") {
      res.status(BAD_REQUEST_CODE).send(SITE_ID_MISSING_MSG);
    } else {
      deleteSite(Number(site_id))
        .then((site_deleted) => {
          if (site_deleted) {
            res.send("Site deleted");
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send("Site could not be deleted because it does not exist");
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

export const rename_site = async (req: Request, res: Response) => {
  if (req.user !== undefined && (await isUserAdmin(req.user.Id))) {
    const { site_id } = req.params;
    const new_site_link = req.body["Site Link"];
    if (typeof site_id !== "undefined" && typeof new_site_link === "string") {
      renameSite(Number(site_id), new_site_link.trim().toLowerCase())
        .then((site_renamed) => {
          if (site_renamed) {
            res.send(`Site renamed to: ${new_site_link}`);
          } else {
            res
              .status(BAD_REQUEST_CODE)
              .send(
                "Site could not be renamed, because either the site does not exist, or that site already exists"
              );
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(INTERNAL_SERVER_ERROR_CODE).send("Database error");
        });
    } else {
      res.status(BAD_REQUEST_CODE).send("Missing parameters");
    }
  } else {
    res.status(UNAUTHORIZED_REQUEST_CODE).send("Unauthorized");
  }
};
