const express = require("express");
const { get_product } = require("../controller/products.controllers");
const { get_all_products } = require("../controller/products.controllers");
const router = express.Router();

router.get("/", get_all_products);

router.get("/:name", get_product);

module.exports = router;
