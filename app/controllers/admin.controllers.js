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
      const products = await Product.find().lean(); // use lean for Handlebars

      res.render("admin/products", {
        layout: "admin",
        products,
      });
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
  async addProduct(req, res) {
    try {
      const {
        title,
        brandLine,
        category,
        subcategory,
        colors,
        dimensions,
        productLine,
        description,
      } = req.body;

      // req.files is array of uploaded files
      const images = req.files.map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path.replace(/\\/g, "/"), // normalize path slashes
        size: file.size,
        mimetype: file.mimetype,
      }));

      // Convert colors string to array (if provided)
      const colorsArray = colors ? colors.split(",").map((c) => c.trim()) : [];

      const newProduct = new Product({
        title,
        brandLine,
        category,
        subcategory,
        colors: colorsArray,
        dimensions,
        productLine,
        description,
        images,
      });

      await newProduct.save();

      res.render("admin/products", { layout: "admin" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },

  async editProduct(req, res) {
    try {
      const { ID } = req.params;
      const product = await Product.findById(ID).lean();
      console.log(product);
      res.render("admin/editProduct", { layout: "admin", product });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
};
