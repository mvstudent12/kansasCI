const Product = require("../models/Product");

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
      const images = req.files.map((file) => ({
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path.replace(/\\/g, "/").replace(/^public\//, "/"), //normalize path slashes and remove public from path
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
        details,
        images,
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
      if (typeof existingImages === "string") {
        existingImages = [existingImages];
      }

      // Get current product from DB
      const product = await Product.findById(productId);
      if (!product) return res.status(404).send("Product not found");

      console.log("Existing images from form:", existingImages);
      console.log(
        "Current product images:",
        product.images.map((i) => i.fileName)
      );

      // Identify which images were removed
      const removedImages = product.images.filter(
        (img) => !existingImages.includes(img.fileName)
      );

      // Delete removed images from disk
      for (const img of removedImages) {
        // img.path probably starts with "/uploads/filename.ext"
        // so we join with public folder safely:
        const filePath = path.join(
          __dirname,
          "..",
          "public",
          img.path.replace(/^\//, "")
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      }

      // Keep only the retained images
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

      // Update fields
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
      product.updatedAt = new Date();

      await product.save();
      console.log("Updated product:", product);

      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
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
      if (product.imageFiles && product.imageFiles.length) {
        product.imageFiles.forEach((imgPath) => {
          const fullPath = path.join(__dirname, "../../public", imgPath); // already includes /uploads
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.warn("Failed to delete file:", fullPath, err.message);
            }
          });
        });
      }

      // Delete the product
      await Product.findByIdAndDelete(ID);

      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async openOrders(req, res) {
    try {
      const orders = await Customer.find({ status: "Pending" }).lean();
      console.log(orders);

      res.render("admin/openOrders", {
        layout: "admin",
        orders,
      });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async deleteOrder(req, res) {
    try {
      const { ID } = req.params;

      // Update the customer: empty cartItems and inspirationGallery, mark as Completed
      await Customer.findByIdAndUpdate(
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

      // Find customer/order by ID
      const order = await Customer.findById(_id).lean();

      if (!order) {
        return res.status(404).render("error/404", { layout: "error" });
      }
      console.log(order);
      // Render an admin template (e.g., admin/viewOrder.handlebars)
      res.render("admin/viewOrder", { layout: "admin", order });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
};
