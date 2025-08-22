module.exports = {
  async home(req, res) {
    try {
      res.render("public/index", { currentPage: "home" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async contact(req, res) {
    try {
      res.render("public/contact", { currentPage: "contact" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async about(req, res) {
    try {
      res.render("public/about", { currentPage: "about" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async services(req, res) {
    try {
      res.render("public/services", { currentPage: "services" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async signIn(req, res) {
    try {
      res.render("public/signIn", { currentPage: "signIn" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async serviceDetails(req, res) {
    let { category } = req.query;
    const services = require("../data/services");
    const details = services[category];
    try {
      res.render("public/service-details", {
        details,
        category,
      });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async software(req, res) {
    try {
      res.render("software/home", {
        layout: "software",
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
};
