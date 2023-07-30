import { Router } from "express";
import { get_sites, add_site } from "../controller/site.controller";

export const siteRouter: Router = Router();

siteRouter.get("/", get_sites);

siteRouter.post("/", add_site);
