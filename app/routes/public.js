const express = require("express");
const public = express.Router();
const publicController = require("../controllers/publicControllers");

public.get("/", publicController.home);

public.get("/contact", publicController.contact);

public.get("/about", publicController.about);

public.get("/services", publicController.services);

public.get("/signIn", publicController.signIn);

public.get("/serviceDetails", publicController.serviceDetails);

module.exports = public;
