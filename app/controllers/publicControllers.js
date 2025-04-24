const services = require("../data/services");

module.exports = {
  async home(req, res) {
    try {
      res.render("index", { currentPage: "home" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async contact(req, res) {
    try {
      res.render("contact", { currentPage: "contact" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async about(req, res) {
    try {
      res.render("about", { currentPage: "about" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async services(req, res) {
    try {
      res.render("services", { currentPage: "services" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async signIn(req, res) {
    try {
      res.render("signIn", { currentPage: "signIn" });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
  async serviceDetails(req, res) {
    let { category } = req.query;

    const details = services[category];

    try {
      res.render("service-details", {
        details,
        category,
      });
    } catch (err) {
      console.log(err);
      res.render("error/404");
    }
  },
};
