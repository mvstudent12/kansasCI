const express = require("express");
const admin = express.Router();
const adminController = require("../controllers/admin.controllers");

admin.get("/", adminController.signIn);

module.exports = admin;
