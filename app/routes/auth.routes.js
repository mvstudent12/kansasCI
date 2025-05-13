const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");

router.post("/signIn", authController.signIn);
router.post("/logout", authController.logout);

module.exports = router;
