import { Router } from "express";
import {
  add_product,
  get_all_products,
  rename_product,
  delete_product,
  get_product,
  add_product_full,
  change_product_description,
} from "../controller/product.controllers";
import { verify_token, verify_token_is_admin } from "../common/security";

import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log(file);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// A router for product specific api calls
export const productRouter: Router = Router();

// Get all products that exist
productRouter.get("/", get_all_products);

// Used for creating a new product, should have a unique name supplied
productRouter.post("/", verify_token, add_product);

// Used for creating a new product, with both sites and an image potentially included
productRouter.post(
  "/create",
  verify_token,
  verify_token_is_admin,
  upload.single("Image"),
  add_product_full
);

// Get a single product
productRouter.get("/:productId", get_product);

// Used for renaming a product, with a new unique name
productRouter.patch("/name/:id", verify_token, rename_product);

// Used for changing a products description
productRouter.patch(
  "/description/:id",
  verify_token,
  change_product_description
);

// Used for deleting a product
productRouter.delete("/:id", verify_token, delete_product);
