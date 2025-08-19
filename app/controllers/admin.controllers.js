const Product = require("../models/Product");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

const fs = require("fs");
const path = require("path");

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
  async customers(req, res) {
    try {
      const customers = await Customer.find().lean(); // use lean for Handlebars

      res.render("admin/customers", {
        layout: "admin",
        customers,
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
        details,
      } = req.body;

      // req.files is array of uploaded files
      const images = (req.files || []).map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path.replace(/\\/g, "/").replace(/^public\//, "/"), // normalize path
        size: file.size,
        mimetype: file.mimetype,
      }));

      // Convert colors string to array (if provided)
      const colorsArray = colors ? colors.split(",").map((c) => c.trim()) : [];

      // ✅ Handle visibility checkbox
      const visible = req.body.visible ? true : false;

      const newProduct = new Product({
        title,
        brandLine,
        category,
        subcategory,
        colors: colorsArray,
        dimensions,
        productLine,
        description,
        details,
        images,
        visible, // ✅ include visibility
      });

      await newProduct.save();
      res.redirect("/admin/products");
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async editProduct(req, res) {
    try {
      const { ID } = req.params;
      const product = await Product.findById(ID).lean();
      res.render("admin/editProduct", { layout: "admin", product });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async deleteProduct(req, res) {
    try {
      const { ID } = req.params;

      const product = await Product.findById(ID);
      if (!product) {
        return res.status(404).render("error/404", { layout: "error" });
      }

      // Delete image files
      if (product.images && product.images.length) {
        product.images.forEach((img) => {
          const fullPath = path.join(
            __dirname,
            "../../public",
            img.path.replace(/^\//, "")
          );
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.warn("Failed to delete file:", fullPath, err.message);
            } else {
              console.log("Deleted file:", fullPath);
            }
          });
        });
      }

      // Delete the product document
      await Product.findByIdAndDelete(ID);

      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async editProductDB(req, res) {
    try {
      const productId = req.params.ID;
      let {
        title,
        brandLine,
        productLine,
        category,
        subcategory,
        colors,
        dimensions,
        description,
        details,
        existingImages = [], // could be string or array
      } = req.body;

      // Normalize existingImages to always be an array
      if (typeof existingImages === "string") existingImages = [existingImages];

      // Get current product from DB
      const product = await Product.findById(productId);
      if (!product) return res.status(404).send("Product not found");

      // Identify removed images
      const removedImages = product.images.filter(
        (img) => !existingImages.includes(img.fileName)
      );

      // Delete removed images from disk
      for (const img of removedImages) {
        const filePath = path.join(
          __dirname,
          "..",
          "public",
          img.path.replace(/^\//, "")
        );
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }

      // Retain only images that are still in existingImages
      const retainedImages = product.images.filter((img) =>
        existingImages.includes(img.fileName)
      );

      // Append new uploaded images
      const newImages = (req.files || []).map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        path: "/uploads/" + file.filename,
        size: file.size,
        mimetype: file.mimetype,
      }));

      // Update product fields
      product.title = title;
      product.brandLine = brandLine;
      product.productLine = productLine;
      product.category = category;
      product.subcategory = subcategory;
      product.colors = colors ? colors.split(",").map((c) => c.trim()) : [];
      product.dimensions = dimensions;
      product.description = description;
      product.details = details;
      product.images = [...retainedImages, ...newImages];
      product.visible = req.body.visible ? true : false;
      product.updatedAt = new Date();

      await product.save();
      console.log("Updated product:", product);

      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async openOrders(req, res) {
    try {
      // Fetch all orders with status "Pending" and populate customer info
      let orders = await Order.find({ status: "Pending" })
        .populate("customerId") // gets the full customer document
        .lean();

      // Separate customer from order for each
      orders = orders.map((order) => {
        const customer = order.customerId;
        delete order.customerId;
        return { ...order, customer };
      });

      console.log(orders);

      res.render("admin/openOrders", {
        layout: "admin",
        orders, // each order now has a separate 'customer' object
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async deleteOrder(req, res) {
    try {
      const { ID } = req.params;

      // Update the order: empty cartItems and inspirationGallery, mark as Completed
      await Order.findByIdAndUpdate(
        ID,
        {
          $set: { cartItems: [], inspirationGallery: [], status: "Completed" },
        },
        { new: true }
      );

      res.redirect("/admin/openOrders"); // redirect after update
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async viewOrder(req, res) {
    try {
      const { _id } = req.params;

      // Find order by ID and populate customer info
      let order = await Order.findById(_id).populate("customerId").lean();

      if (!order) {
        return res.status(404).render("error/404", { layout: "error" });
      }

      // Separate customer from order
      const customer = order.customerId;
      delete order.customerId;

      console.log("Order:", order);
      console.log("Customer:", customer);

      // Render admin template with separate customer object
      res.render("admin/viewOrder", {
        layout: "admin",
        order,
        customer,
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
};
