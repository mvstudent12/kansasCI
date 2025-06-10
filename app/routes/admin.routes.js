const express = require("express");
const admin = express.Router();
const adminController = require("../controllers/admin.controllers");

admin.get("/", adminController.signIn);

admin.get("/dashboard", adminController.dashboard);

admin.get("/products", adminController.products);

admin.get("/contacts", adminController.contacts);

module.exports = admin;
