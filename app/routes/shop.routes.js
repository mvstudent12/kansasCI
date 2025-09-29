const express = require("express");
const shop = express.Router();
const shopController = require("../controllers/shop.controllers");

shop.get("/", shopController.shop);

shop.get("/searchProducts", shopController.searchProducts);

shop.get("/product-details/:ID", shopController.productDetails);

shop.get("/checkout", shopController.checkout);

shop.get("/galleryRoom", shopController.galleryRoom);

shop.get("/furniture", shopController.furniture);

shop.get("/seating", shopController.seating);

shop.get("/textiles", shopController.textiles);

shop.get("/signs", shopController.signs);

shop.get("/awards", shopController.awards);

shop.get("/metal", shopController.metal);

shop.get("/janitorial", shopController.janitorial);

shop.post("/submitOrder", shopController.submitOrder);

shop.get("/order-Confirmation/:orderId", shopController.orderConfirmation);

shop.get("/cart", shopController.cart);

shop.post("/cart/add/:productID", shopController.addToCart);

shop.post("/cart/remove/:productID", shopController.removeFromCart);

shop.get("/wishList", shopController.wishList);

shop.get("/wishList/add", shopController.addToWishList);

shop.get("/wishList/remove/", shopController.removeFromWishList);

shop.get("/wishList/moveToCart/", shopController.moveToCart);

shop.get("/inspirationList", shopController.inspirationList);

shop.get("/inspirationList/add/", shopController.addToInspirationList);

shop.get("/inspirationList/remove/", shopController.removeFromInspirationList);

module.exports = shop;
