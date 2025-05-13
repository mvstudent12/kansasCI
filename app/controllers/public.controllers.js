const Product = require("../models/Product");

module.exports = {
  async home(req, res) {
    try {
      res.render("public/index", { currentPage: "home" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async contact(req, res) {
    try {
      res.render("public/contact", { currentPage: "contact" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async about(req, res) {
    try {
      res.render("public/about", { currentPage: "about" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async services(req, res) {
    try {
      res.render("public/services", { currentPage: "services" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async signIn(req, res) {
    try {
      res.render("public/signIn", { currentPage: "signIn" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async serviceDetails(req, res) {
    let { category } = req.query;
    const services = require("../data/services");
    const details = services[category];
    try {
      res.render("public/services/service-details", {
        details,
        category,
      });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async serviceItems(req, res) {
    let { category } = req.query;
    const services = require("../data/services");

    const details = services[category];
    console.log(details.category);

    const products = await Product.find({
      category: details.category,
      product: true,
    }).lean();
    console.log(products);

    try {
      res.render("public/services/service-items", {
        details,
        category,
        products,
      });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
};
