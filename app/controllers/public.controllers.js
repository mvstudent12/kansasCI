const Product = require("../models/Product");

const fs = require("fs").promises;
const path = require("path");

module.exports = {
  async home(req, res) {
    try {
      res.render("public/index", { currentPage: "home" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  // Assuming you have a Product model
  async searchProducts(req, res) {
    try {
      const searchTerm = req.query.q;

      if (!searchTerm || searchTerm.trim() === "") {
        return res.redirect("/products"); // or render empty results
      }

      // Case-insensitive regex search across title, brand, or category
      const regex = new RegExp(searchTerm, "i");

      const results = await Product.find({
        $or: [
          { title: regex },
          { brand: regex },
          { category: regex },
          { description: regex },
        ],
      })
        .limit(12)
        .lean();

      res.render("shop/search-results", {
        layout: "shop",
        products: results,
        query: searchTerm,
      });
    } catch (err) {
      console.error(err);
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
  async shop(req, res) {
    try {
      res.render("shop/kcishop", { layout: "shop" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async galleryRoom(req, res) {
    try {
      const jsonPath = path.join(
        __dirname,
        "../../public/data/gallery-images.json"
      );

      const data = await fs.readFile(jsonPath, "utf-8");
      const allImages = JSON.parse(data);

      const perPage = 12;
      const page = parseInt(req.query.page) || 1;
      let selectedCategories = req.query.category || [];

      // Normalize to array
      if (typeof selectedCategories === "string") {
        selectedCategories = [selectedCategories];
      }

      // Filter images if categories are selected
      const filteredImages = selectedCategories.length
        ? allImages.filter((img) => selectedCategories.includes(img.category))
        : allImages;

      const totalCount = filteredImages.length;
      const paginatedImages = filteredImages.slice(
        (page - 1) * perPage,
        page * perPage
      );

      // Get unique categories for the filter list
      const allCategories = [...new Set(allImages.map((img) => img.category))];

      console.log(req.path);

      res.render("shop/gallery-room", {
        layout: "shop",
        images: paginatedImages,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        allCategories,
        selectedCategories,
        currentPath: req.path,
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async products(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page) || 1;
      const selectedCategories = req.query.category || []; // array or string

      let filter = {};
      if (selectedCategories.length) {
        filter.category = Array.isArray(selectedCategories)
          ? { $in: selectedCategories }
          : selectedCategories;
      }

      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      res.render("shop/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedCategories: Array.isArray(selectedCategories)
          ? selectedCategories
          : [selectedCategories],
        currentPath: req.path,
      });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async productDetails(req, res) {
    try {
      const { ID } = req.params;
      const product = await Product.findById(ID).lean();
      console.log(product);
      res.render("shop/product-detail", { layout: "shop", product });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async cart(req, res) {
    try {
      res.render("shop/cart", { layout: "shop" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async favorites(req, res) {
    try {
      res.render("shop/favorites", { layout: "shop" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async checkout(req, res) {
    try {
      res.render("shop/checkout", { layout: "shop" });
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
};
