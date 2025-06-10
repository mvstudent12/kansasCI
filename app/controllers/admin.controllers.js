const Product = require("../models/Product");

module.exports = {
  async signIn(req, res) {
    try {
      res.render("admin/signIn", { currentPage: "signIn" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async dashboard(req, res) {
    try {
      res.render("admin/dashboard", { layout: "admin" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async products(req, res) {
    try {
      res.render("admin/products", { layout: "admin" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async contacts(req, res) {
    try {
      res.render("admin/contacts", { layout: "admin" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
};
