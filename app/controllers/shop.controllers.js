const { Product, Order, Customer } = require("../models");

const fs = require("fs").promises;
const path = require("path");

const categoriesData = require("../../public/data/categories.json");

module.exports = {
  async shop(req, res) {
    try {
      res.render("shop/kcishop", { layout: "shop" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async searchProducts(req, res) {
    try {
      const searchTerm = req.query.q;

      if (!searchTerm || searchTerm.trim() === "") {
        return res.redirect("/products"); // or render empty results
      }

      // Case-insensitive regex search across title, brand, or category
      const regex = new RegExp(searchTerm, "i");

      const results = await Product.find({
        visible: true, // ✅ only return products marked visible
        $or: [
          { title: regex },
          { brandLine: regex },
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
  async productDetails(req, res) {
    try {
      const { ID } = req.params;
      const product = await Product.findById(ID).lean();
      const wishList = req.session.wishList || [];

      // Read toast from query
      const cartMessage = req.query.toast === "added" ? "Added to cart!" : null;

      res.render("shop/product-detail", {
        layout: "shop",
        product,
        wishList,
        cartMessage,
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

      // === Normalize query params ===
      const rawCategory = req.query.category || null; // single or multiple categories
      const selectedCategories = Array.isArray(rawCategory)
        ? rawCategory
        : rawCategory
        ? [rawCategory]
        : [];

      const rawSubcats = req.query.subcategory || [];
      let selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      selectedSubcategories = selectedSubcategories.map((s) =>
        decodeURIComponent(s)
      );

      const rawBrands = req.query.brand || [];
      const selectedBrands = Array.isArray(rawBrands)
        ? rawBrands
        : rawBrands
        ? [rawBrands]
        : [];

      const rawLine = req.query.line || null;
      const selectedLines = rawLine ? [rawLine] : [];

      // === Build furniture taxonomy from categories JSON ===
      const furnitureEntries = categoriesData.filter(
        (c) => c.metaCategory === "Furniture"
      );
      const furnitureTypes = furnitureEntries.map((c) => c.name); // e.g., Desks, Seating

      // === Determine categories to filter by ===
      const categoriesToFilter = selectedCategories.length
        ? selectedCategories
        : furnitureTypes;

      // === Determine subcategories for selected category ===
      let subcategoriesToRender = [];
      if (selectedCategories.length === 1) {
        const categoryEntry = furnitureEntries.find(
          (c) => c.name === selectedCategories[0]
        );
        if (categoryEntry)
          subcategoriesToRender = categoryEntry.subcategories || [];
      }

      // === Build Mongo filter ===
      const filter = {
        category: { $in: categoriesToFilter },
        visible: true,
      };

      if (selectedSubcategories.length)
        filter.subcategory = { $in: selectedSubcategories };
      if (selectedBrands.length) filter.brandLine = { $in: selectedBrands };
      if (selectedLines.length) filter.productLine = { $in: selectedLines };

      // === Query products & count ===
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // === Build brandLine list for filter UI ===
      const brands = await Product.distinct("brandLine", {
        category: { $in: categoriesToFilter },
      });

      const normalizedQuery = {};
      for (const key in req.query) {
        if (req.query[key] === undefined || req.query[key] === null) continue;
        normalizedQuery[key] = Array.isArray(req.query[key])
          ? req.query[key]
          : [req.query[key]];
      }

      // === Render template ===
      res.render("shop/categories/furniture", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedCategories,
        selectedSubcategories,
        selectedBrands,
        selectedLines,
        productTypes: furnitureTypes,
        subcategories: subcategoriesToRender,
        brands,
        currentPath: req.path,
        queryParams: req.query, // useful for keeping all filters in pagination
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async products(req, res) {
    try {
      const perPage = 30;
      const page = parseInt(req.query.page, 10) || 1;

      const slug = req.params.category; // e.g. "seating", "signs-and-graphics"

      // Find all entries in categories.json that match this slug
      const entries = categoriesData.filter((c) => c.slug === slug);

      if (!entries.length) {
        return res.render("error/404", { layout: "error" });
      }

      // Collect category names and subcategories
      const categoryNames = entries.map((c) => c.name);
      const subcategoriesToRender = [
        ...new Set(entries.flatMap((c) => c.subcategories)),
      ];

      // Grab selected subcategories from query
      const rawSubcats = req.query.subcategory || [];
      const selectedSubcategories = Array.isArray(rawSubcats)
        ? rawSubcats
        : rawSubcats
        ? [rawSubcats]
        : [];

      // Build Mongo filter
      const filter = {
        category: { $in: categoryNames },
        visible: true,
      };
      if (selectedSubcategories.length) {
        filter.subcategory = { $in: selectedSubcategories };
      }

      // Query products
      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      // Render page
      res.render("shop/categories/products", {
        layout: "shop",
        products,
        currentPage: page,
        totalPages: Math.ceil(totalCount / perPage),
        selectedSubcategories,
        subcategoriesToRender,
        currentPath: req.path,
        name: categoryNames.join(", "), // heading, e.g. "Seating"
        filter: slug, // used in form action
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },

  async checkout(req, res) {
    try {
      res.render("shop/checkout", {
        layout: "shop",
      });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async submitOrder(req, res) {
    try {
      const cart = req.session.cart || [];
      if (!cart.length) {
        return res.status(400).send("Cart is empty");
      }

      // Pull customer info from the form
      const {
        firstName,
        lastName,
        email,
        mobile,
        address1,
        address2,
        city,
        state,
        zip,
        customerType,
        custID,
        companyName,
      } = req.body;

      // Find or create customer
      let customer = await Customer.findOne({ email });
      if (!customer) {
        customer = new Customer({
          firstName,
          lastName,
          email,
          mobile,
          address1,
          address2,
          city,
          state,
          zip,
          customerType,
          custID,
          companyName,
        });
        await customer.save();
      }

      // Map cart items into order schema
      const cartItems = cart.map((item) => ({
        productId: item._id,
        title: item.title,
        brandLine: item.brandLine,
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
        images: item.images || [],
      }));

      // Pull inspiration gallery images from session (file paths only)
      const inspirationGallery = (req.session.inspirationList || []).map(
        (item) => item.filePath
      );

      // Create order with initial activity log
      const order = new Order({
        customerId: customer._id,
        cartItems,
        inspirationGallery,
        activityLog: [
          {
            action: "Order Created",
            description: `Order created for customer ${customer._id}`,
            performedBy: null, // can be admin ID if placed by staff
          },
        ],
        archived: false,
      });

      await order.save();

      // Clear session cart & inspiration gallery
      req.session.cart = [];
      req.session.inspirationList = [];
      await req.session.save();

      res.redirect(`/shop/order-Confirmation/${order._id}`);
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async orderConfirmation(req, res) {
    try {
      const order = await Order.findById(req.params.orderId)
        .populate("customerId") // populate customer info
        .lean();

      if (!order) return res.status(404).send("Order not found");

      // Separate customer object from order
      const customer = order.customerId;
      delete order.customerId; // remove from order to avoid duplication

      res.render("shop/order-confirmation", {
        layout: "shop",
        order,
        customer, // now available separately in the template
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async cart(req, res) {
    try {
      res.render("shop/cart", {
        layout: "shop",
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async addToCart(req, res) {
    try {
      const { productID } = req.params;
      const product = await Product.findById(productID).lean();
      if (!product) return res.status(404).send("Product not found");

      if (!req.session.cart) req.session.cart = [];

      const qty = parseInt(req.body.quantity) || 1;
      const existingItem = req.session.cart.find(
        (item) => item._id.toString() === product._id.toString()
      );

      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        req.session.cart.push({ ...product, quantity: qty });
      }

      await req.session.save();

      // Redirect with query param for toast
      res.redirect(`/shop/product-details/${productID}?toast=added`);
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async addToWishList(req, res) {
    try {
      if (!req.session.wishList) req.session.wishList = [];
      const { productId } = req.query;
      if (!productId) return res.status(400).send("No product specified");

      const exists = req.session.wishList.some(
        (item) => item.type === "product" && item.id === String(productId)
      );

      if (!exists)
        req.session.wishList.push({ type: "product", id: String(productId) });

      await req.session.save();

      res.redirect(`/shop/product-details/${productId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Unable to add to wishlist");
    }
  },
  async removeFromWishList(req, res) {
    try {
      if (!req.session.wishList) req.session.wishList = [];
      const { productId } = req.query;
      if (!productId)
        return res.status(400).send("No product specified to remove");

      req.session.wishList = req.session.wishList.filter(
        (item) => !(item.type === "product" && item.id === String(productId))
      );

      await req.session.save();

      res.redirect(`/shop/product-details/${productId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Unable to remove from wishlist");
    }
  },
  async removeFromCart(req, res) {
    try {
      if (req.session.cart) {
        req.session.cart = req.session.cart.filter(
          (item) => item._id.toString() !== req.params.productID
        );
      }
      req.session.save(() => {
        res.redirect("/shop/cart");
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async wishList(req, res) {
    try {
      const rawWishList = req.session.wishList || [];

      // Only keep product items
      const productItems = rawWishList.filter(
        (item) => item.type === "product"
      );

      // Collect product IDs
      const productIds = productItems.map((item) => item.id);

      // Fetch products from DB
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      // Enrich wishlist items for rendering
      const enrichedWishList = productItems.map((item) => {
        const product = products.find((p) => p._id.toString() === item.id);

        return {
          type: "product",
          id: item.id,
          title: product?.title || "Product",
          productImage: product?.images?.[0]?.path || null,
        };
      });

      res.render("shop/wishList", {
        layout: "shop",
        wishList: enrichedWishList,
      });
    } catch (err) {
      console.error("Error rendering wishlist:", err);
      res.render("error/404", { layout: "error" });
    }
  },
  async moveToCart(req, res) {
    try {
      const { productId, file } = req.query;

      if (!req.session.cart) req.session.cart = [];

      if (productId) {
        // Fetch full product object from DB
        const product = await Product.findById(productId).lean();
        if (product) {
          // Check if already in cart
          const existing = req.session.cart.find(
            (i) => i._id?.toString() === product._id.toString()
          );
          if (existing) {
            existing.quantity += 1; // increment if already in cart
          } else {
            req.session.cart.push({ ...product, quantity: 1 });
          }
        }
      } else if (file) {
        // Gallery item: store minimal object
        if (
          !req.session.cart.some(
            (i) => i.type === "gallery" && i.filePath === file
          )
        ) {
          req.session.cart.push({
            type: "gallery",
            filePath: file,
            quantity: 1,
          });
        }
      }

      // Remove from wishlist
      if (!req.session.wishList) req.session.wishList = [];
      req.session.wishList = req.session.wishList.filter((item) => {
        if (productId && item.type === "product") return item.id !== productId;
        if (file && item.type === "gallery") return item.filePath !== file;
        return true;
      });

      await req.session.save();

      res.redirect(req.get("referer") || "/shop/wishList");
    } catch (err) {
      console.error("Error moving item to cart:", err);
      res.status(500).send("Unable to move item to cart");
    }
  },
  async inspirationList(req, res) {
    try {
      res.render("shop/inspirationGallery", {
        layout: "shop",
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async addToInspirationList(req, res) {
    try {
      if (!req.session.inspirationList) req.session.inspirationList = [];
      const { file } = req.query;
      if (!file)
        return res
          .status(400)
          .json({ success: false, message: "No file specified" });

      const exists = req.session.inspirationList.some(
        (item) => item.filePath === file
      );
      if (!exists)
        req.session.inspirationList.push({ type: "gallery", filePath: file });

      await req.session.save();
      res.json({ success: true, count: req.session.inspirationList.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Unable to add image" });
    }
  },
  async removeFromInspirationList(req, res) {
    try {
      if (!req.session.inspirationList) req.session.inspirationList = [];

      const { file } = req.query;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No gallery image specified to remove",
        });
      }

      req.session.inspirationList = req.session.inspirationList.filter(
        (item) => item.filePath !== file
      );

      await req.session.save();

      // Return JSON instead of redirect
      res.json({ success: true });
    } catch (err) {
      console.error("Error removing from inspiration list:", err);
      res.status(500).json({
        success: false,
        message: "Unable to remove from inspiration list",
      });
    }
  },
};
