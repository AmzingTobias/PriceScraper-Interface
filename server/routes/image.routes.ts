import { Router } from "express";
import {
  add_image,
  get_all_images,
  get_image_for_product,
  get_image_with_id,
  remove_image,
  remove_image_from_product,
  set_image_for_product,
} from "../controller/image.controller";
import { verify_token, verify_token_is_admin } from "../common/security";
import { validate } from "../middleware/validate";
import { setImageForProductSchema } from "../common/validation";
import { v4 as uuidv4 } from "uuid";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (_req, file, cb) {
    const ext = ALLOWED_EXTENSIONS[file.mimetype] ?? ".jpg";
    cb(null, uuidv4() + ext);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const imageRouter = Router();

// Get all images
imageRouter.get("/", verify_token, get_all_images);

// Get the image for a product (public — no auth required for product pages)
// Must be registered BEFORE /:id to avoid being shadowed by that wildcard
imageRouter.get("/product/:productId", get_image_for_product);

// Upload a new image (admin only)
imageRouter.post(
  "/",
  verify_token,
  verify_token_is_admin,
  upload.single("image"),
  add_image
);

// Get an image by Id
imageRouter.get("/:id", verify_token, get_image_with_id);

// Remove the image link from a product
imageRouter.delete("/product/:productId", verify_token, remove_image_from_product);

// Set the image for a product
imageRouter.patch(
  "/product/:productId",
  verify_token,
  validate(setImageForProductSchema),
  set_image_for_product
);

// Delete an image
imageRouter.delete("/:Id", verify_token, remove_image);
