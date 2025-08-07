const express = require("express");
const admin = express.Router();
const adminController = require("../controllers/admin.controllers");

const upload = require("../middelware/upload");

admin.get("/", adminController.signIn);

admin.get("/dashboard", adminController.dashboard);

admin.get("/products", adminController.products);

admin.get("/contacts", adminController.contacts);

admin.post(
  "/addProduct",
  upload.array("imageFiles", 10),
  adminController.addProduct
);
admin.get("/editProduct/:ID", adminController.editProduct);

admin.post(
  "/editProductDB/:ID",
  upload.array("imageFiles", 10),
  adminController.editProductDB
);

module.exports = admin;
