import { Router } from "express";
import {
  get_sites,
  add_site,
  remove_site,
  get_site_with_id,
  rename_site,
} from "../controller/site.controller";
import { verify_token } from "../common/security";
import { validate } from "../middleware/validate";
import { createSiteSchema, renameSiteSchema } from "../common/validation";

export const siteRouter: Router = Router();

// Get all sites, or sites for a specific product
siteRouter.get("/", verify_token, get_sites);

// Create a new site link
siteRouter.post("/", verify_token, validate(createSiteSchema), add_site);

// Get a specific site
siteRouter.get("/:site_id", verify_token, get_site_with_id);

// Delete a site link
siteRouter.delete("/:site_id", verify_token, remove_site);

// Rename a site link
siteRouter.patch("/:site_id", verify_token, validate(renameSiteSchema), rename_site);
