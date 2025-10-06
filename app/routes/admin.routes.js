const express = require("express");
const admin = express.Router();
const adminController = require("../controllers/admin.controllers");

const upload = require("../middelware/upload");

admin.get("/", adminController.signIn);

admin.get("/dashboard", adminController.dashboard);

admin.get("/analytics", adminController.analytics);

admin.get("/products", adminController.products);

admin.get("/products/data", adminController.productsData);

admin.get("/calendar", adminController.calendar);

admin.post("/addEvent", adminController.addEvent);

admin.get("/getEvents", adminController.getEvents);

admin.get("/events", adminController.events);

admin.get("/customers", adminController.customers);

admin.get("/viewCustomer/:ID", adminController.viewCustomer);

admin.post("/editCustomer/:ID", adminController.editCustomer);

admin.get("/openOrders", adminController.openOrders);

admin.get("/orderHistory", adminController.orderHistory);

admin.get("/viewOrder/:_id", adminController.viewOrder);

admin.get("/voidOrder/:ID", adminController.voidOrder);

admin.get("/contacts", adminController.contacts);

admin.post("/addNewUser", adminController.addNewUser);

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

admin.get("/deleteProduct/:ID", adminController.deleteProduct);

module.exports = admin;
