const express = require("express");
const public = express.Router();
const publicController = require("../controllers/public.controllers");

const Product = require("../models/Product");

public.get("/", publicController.home);

public.get("/signIn", publicController.signIn);

public.get("/searchProducts", publicController.searchProducts);

public.get("/contact", publicController.contact);

public.get("/about", publicController.about);

public.get("/services", publicController.services);

public.get("/shop", publicController.shop);

public.get("/products", publicController.products);

public.get(
  "/product-details/:ID",

  publicController.productDetails
);

public.get("/cart", publicController.cart);

public.get(
  "/favorites/:filePath",

  publicController.favorites
);

public.get("/checkout", publicController.checkout);

public.get(
  "/serviceDetails",

  publicController.serviceDetails
);

public.get("/galleryRoom", publicController.galleryRoom);

public.get("/furniture", publicController.furniture);

public.get("/seating", publicController.seating);

public.get("/textiles", publicController.textiles);

public.get("/signs", publicController.signs);

public.get("/metal", publicController.metal);

public.get("/janitorial", publicController.janitorial);

public.get("/software", publicController.software);

module.exports = public;
