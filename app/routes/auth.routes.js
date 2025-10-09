const express = require("express");
const auth = express.Router();
const authController = require("../controllers/authController");

// POST login
auth.post("/admin/signIn", authController.signIn);

// GET logout
// auth.get("/admin/logout", authController.logout);

module.exports = auth;
