const express = require("express");
const public = express.Router();
const publicController = require("../controllers/public.controllers");

const Product = require("../models/Product");

async function loadAllCategories(req, res, next) {
  try {
    const allCategories = await Product.distinct("category");
    res.locals.allCategories = allCategories;
    next();
  } catch (err) {
    next(err);
  }
}

public.get("/", publicController.home);

public.get("/signIn", publicController.signIn);

public.get("/searchProducts", publicController.searchProducts);

public.get("/contact", publicController.contact);

public.get("/about", publicController.about);

public.get("/services", publicController.services);

public.get("/shop", loadAllCategories, publicController.shop);

public.get("/products", loadAllCategories, publicController.products);

public.get(
  "/product-details/:ID",
  loadAllCategories,
  publicController.productDetails
);

public.get("/cart", loadAllCategories, publicController.cart);

public.get(
  "/favorites/:filePath",
  loadAllCategories,
  publicController.favorites
);

public.get("/checkout", loadAllCategories, publicController.checkout);

public.get(
  "/serviceDetails",
  loadAllCategories,
  publicController.serviceDetails
);

public.get("/galleryRoom", loadAllCategories, publicController.galleryRoom);

module.exports = public;
