import { Router } from "express";
import {
  get_sites,
  add_site,
  remove_site,
  get_site_with_id,
  rename_site,
} from "../controller/site.controller";

export const siteRouter: Router = Router();

// Used for getting either all sites, or all sites for a given product
siteRouter.get("/", get_sites);

// Create a new site link to a product
siteRouter.post("/", add_site);

// Get a specific site using a site Id
siteRouter.get("/:site_id", get_site_with_id);

// Delete a site link to a product, using a site Id
siteRouter.delete("/:site_id", remove_site);

// Rename a site link for an entry that already exists
siteRouter.patch("/:site_id", rename_site);
