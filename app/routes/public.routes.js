const express = require("express");
const public = express.Router();
const publicController = require("../controllers/public.controllers");

public.get("/", publicController.home);

public.get("/signIn", publicController.signIn);

public.get("/contact", publicController.contact);

public.get("/about", publicController.about);

public.get("/services", publicController.services);

public.get("/serviceDetails", publicController.serviceDetails);

public.get("/software", publicController.software);

module.exports = public;
