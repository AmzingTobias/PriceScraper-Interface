import { Router } from "express";
import { get_sites } from "../controller/site.controller";

export const siteRouter: Router = Router();

siteRouter.get("/", get_sites);
