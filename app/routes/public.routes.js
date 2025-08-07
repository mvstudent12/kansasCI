const express = require("express");
const public = express.Router();
const publicController = require("../controllers/public.controllers");

public.get("/", publicController.home);

public.get("/signIn", publicController.signIn);

public.get("/contact", publicController.contact);

public.get("/about", publicController.about);

public.get("/services", publicController.services);

public.get("/shop", publicController.shop);

public.get("/products", publicController.products);

public.get("/product-details/:ID", publicController.productDetails);

public.get("/cart", publicController.cart);

public.get("/favorites/:filePath", publicController.favorites);

public.get("/checkout", publicController.checkout);

public.get("/serviceDetails", publicController.serviceDetails);

public.get("/officeGallery", publicController.officeGallery);

module.exports = public;
