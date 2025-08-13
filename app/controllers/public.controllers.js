const Product = require("../models/Product");

const fs = require("fs").promises;
const path = require("path");

const categoriesData = require("../../public/data/categories.json");

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

      let selectedCategories = [];
      let selectedMetaCategory = null;

      if (req.query.metaCategory) {
        selectedMetaCategory = req.query.metaCategory;

        // Get all categories belonging to the metaCategory
        selectedCategories = categoriesData
          .filter((cat) => cat.metaCategory === selectedMetaCategory)
          .map((cat) => cat.name);
      } else if (req.query.category) {
        // category param can be string or array
        selectedCategories = Array.isArray(req.query.category)
          ? req.query.category
          : [req.query.category];
      }

      // Build Mongo filter
      let filter = {};
      if (selectedCategories.length) {
        filter.category = { $in: selectedCategories };
      }

      // Fetch filtered products and count
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // Determine categories to show in filter sidebar:
      // If filtering by metaCategory, show only categories under it,
      // else show all distinct categories in DB.
      let allCategoriesForFilter = [];
      if (selectedMetaCategory) {
        allCategoriesForFilter = categoriesData
          .filter((cat) => cat.metaCategory === selectedMetaCategory)
          .map((cat) => cat.name);
      } else {
        allCategoriesForFilter = await Product.distinct("category");
      }

      // Get unique metaCategories for dynamic nav
      const metaCategories = [
        ...new Set(categoriesData.map((c) => c.metaCategory)),
      ];

      res.render("shop/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedCategories,
        selectedMetaCategory,
        allCategories: allCategoriesForFilter,
        metaCategories,
        currentPath: req.path,
      });
    } catch (err) {
      console.error("Error loading products:", err);
      res.render("error/404", { layout: "error" });
    }
  },
  async productDetails(req, res) {
    try {
      const { ID } = req.params;
      const product = await Product.findById(ID).lean();

      res.render("shop/product-detail", { layout: "shop", product });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async cart(req, res) {
    try {
      res.render("shop/cart", {
        layout: "shop",
        cart: req.session.cart || [],
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },

  async addToCart(req, res) {
    try {
      const product = await Product.findById(req.params.productID).lean();
      if (!product) {
        return res.status(404).send("Product not found");
      }

      if (!req.session.cart) {
        req.session.cart = [];
      }

      // Check if product already in cart
      const existingItem = req.session.cart.find(
        (item) => item._id.toString() === product._id.toString()
      );
      const qty = parseInt(req.body.quantity) || 1;

      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        req.session.cart.push({ ...product, quantity: qty });
      }

      // Save the session and redirect
      req.session.save(() => {
        res.redirect("/cart"); // or res.redirect("back") to go to the same page
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },

  async removeFromCart(req, res) {
    try {
      if (req.session.cart) {
        req.session.cart = req.session.cart.filter(
          (item) => item._id.toString() !== req.params.productID
        );
      }
      res.render("shop/cart", {
        layout: "shop",
        cart: req.session.cart || [],
      });
    } catch (err) {
      console.error(err);
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
  async furniture(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page, 10) || 1;

      // === Normalize incoming query params ===
      const rawCategory = req.query.category || null; // only one category allowed
      const selectedCategories = rawCategory ? [rawCategory] : [];

      const rawSubcats = req.query.subcategory || [];
      const selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      const rawBrands = req.query.brand || [];
      const selectedBrands = Array.isArray(rawBrands)
        ? rawBrands
        : rawBrands
        ? [rawBrands]
        : [];

      // === Build furniture taxonomy from categories JSON ===
      const furnitureEntries = categoriesData.filter(
        (c) => c.metaCategory === "Furniture"
      );

      const furnitureTypes = furnitureEntries.map((c) => c.name); // product types

      // === Determine categories to filter by ===
      const categoriesToFilter = selectedCategories.length
        ? selectedCategories
        : furnitureTypes;

      // === Dynamic subcategories for selected category ===
      let subcategoriesToRender = [];
      if (selectedCategories.length === 1) {
        const categoryEntry = furnitureEntries.find(
          (c) => c.name === selectedCategories[0]
        );
        if (categoryEntry)
          subcategoriesToRender = categoryEntry.subcategories || [];
      }

      // === Build Mongo filter ===
      const filter = { category: { $in: categoriesToFilter } };
      if (selectedSubcategories.length)
        filter.subcategory = { $in: selectedSubcategories };
      if (selectedBrands.length) filter.brand = { $in: selectedBrands };

      // === Query products & count ===
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // === Build brand list for filter UI ===
      const brands = await Product.distinct("brand", {
        category: { $in: categoriesToFilter },
      });

      // === Render template ===
      res.render("shop/categories/furniture", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedCategories,
        selectedSubcategories,
        selectedBrands,
        productTypes: furnitureTypes,
        subcategories: subcategoriesToRender, // dynamic
        brands,
        currentPath: req.path,
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async seating(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page, 10) || 1;

      // === Selected subcategories from query params ===
      const rawSubcats = req.query.subcategory || [];
      const selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      // === Get seating category entry from categoriesData ===
      const seatingEntry = categoriesData.find(
        (c) => c.metaCategory === "Furniture" && c.name === "Seating"
      );

      const seatingSubcategories = seatingEntry?.subcategories || [];

      // === Build Mongo filter ===
      const filter = {
        category: "Seating",
      };
      if (selectedSubcategories.length)
        filter.subcategory = { $in: selectedSubcategories };

      // === Query products & count ===
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      res.render("shop/categories/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedSubcategories,
        subcategoriesToRender: seatingSubcategories,
        currentPath: req.path,
        name: "Seating",
        filter: "seating",
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async textiles(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page, 10) || 1;

      // === Selected subcategories from query params ===
      const rawSubcats = req.query.subcategory || [];
      const selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      // === Gather all subcategories under the Textiles metaCategory ===
      const textilesEntries = categoriesData.filter(
        (c) => c.metaCategory === "Textiles"
      );
      const textilesSubcategories = [
        ...new Set(textilesEntries.flatMap((c) => c.subcategories)),
      ];

      // === Build Mongo filter ===
      const filter = {
        category: { $in: ["Textiles", "Clothing"] },
      };
      if (selectedSubcategories.length) {
        filter.subcategory = { $in: selectedSubcategories };
      }

      // === Query products & count ===
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // === Render using the same template as Seating / Furniture ===
      res.render("shop/categories/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedSubcategories,
        subcategoriesToRender: textilesSubcategories,
        currentPath: req.path,
        name: "Clothing & Textiles", // used for page heading or breadcrumbs
        filter: "textiles",
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async signs(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page, 10) || 1;

      // === Selected subcategories from query params ===
      const rawSubcats = req.query.subcategory || [];
      const selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      // === Gather all subcategories under the Signs metaCategory ===
      const signsEntries = categoriesData.filter(
        (c) => c.metaCategory === "Signs"
      );
      const signsSubcategories = [
        ...new Set(signsEntries.flatMap((c) => c.subcategories)),
      ];

      // === Build Mongo filter ===
      const filter = {
        category: { $in: signsEntries.map((c) => c.name) }, // e.g. ["Signs & Graphics"]
      };
      if (selectedSubcategories.length) {
        filter.subcategory = { $in: selectedSubcategories };
      }

      // === Query products & count ===
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // === Render using the same template as other categories ===
      res.render("shop/categories/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedSubcategories,
        subcategoriesToRender: signsSubcategories,
        currentPath: req.path,
        name: "Signs & Graphics", // used for page heading or breadcrumbs
        filter: "signs",
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async metal(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page, 10) || 1;

      // === Selected subcategories from query params ===
      const rawSubcats = req.query.subcategory || [];
      const selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      // === Gather all subcategories under the Metal metaCategory ===
      const metalEntries = categoriesData.filter(
        (c) => c.metaCategory === "Metal"
      );
      const metalSubcategories = [
        ...new Set(metalEntries.flatMap((c) => c.subcategories)),
      ];

      // === Build Mongo filter ===
      const filter = {
        category: { $in: metalEntries.map((c) => c.name) }, // e.g. ["Metal Works"]
      };
      if (selectedSubcategories.length) {
        filter.subcategory = { $in: selectedSubcategories };
      }

      // === Query products & count ===
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // === Render using the same template ===
      res.render("shop/categories/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedSubcategories,
        subcategoriesToRender: metalSubcategories,
        currentPath: req.path,
        name: "Metal Works",
        filter: "metal",
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async janitorial(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page, 10) || 1;

      // === Selected subcategories from query params ===
      const rawSubcats = req.query.subcategory || [];
      const selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      // === Gather all subcategories under the Janitorial metaCategory ===
      const janitorialEntries = categoriesData.filter(
        (c) => c.metaCategory === "Janitorial"
      );
      const janitorialSubcategories = [
        ...new Set(janitorialEntries.flatMap((c) => c.subcategories)),
      ];

      // === Build Mongo filter ===
      const filter = {
        category: { $in: janitorialEntries.map((c) => c.name) }, // e.g. ["Janitorial", "Paint"]
      };
      if (selectedSubcategories.length) {
        filter.subcategory = { $in: selectedSubcategories };
      }

      // === Query products & count ===
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // === Render using the same template ===
      res.render("shop/categories/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedSubcategories,
        subcategoriesToRender: janitorialSubcategories,
        currentPath: req.path,
        name: "Janitorial & Paint",
        filter: "janitorial",
      });
    } catch (err) {
      console.error(err);
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
