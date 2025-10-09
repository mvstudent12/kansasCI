const { Product, Order, Customer, Event, User } = require("../models");

const fs = require("fs");
const path = require("path");

const { getUsersWithOpenOrders } = require("../utils/orderHelpers");

// Helper function to convert 12h time to 24h format string
const { convertTimeTo24 } = require("../utils/timeHelpers");

module.exports = {
  async index(req, res) {
    try {
      res.render("admin/signIn", { layout: "error" });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async dashboard(req, res) {
    try {
      // Fetch all active (non-archived) orders with open status
      let orders = await Order.find({
        status: { $nin: ["Completed", "Void"] },
        archived: false,
      })
        .populate("customerId")
        .populate("assignedTo")
        .lean();

      // Restructure orders to separate customer and assignedTo objects
      orders = orders.map((order) => {
        const customer = order.customerId;
        const assignedTo = order.assignedTo || null; // might be unassigned
        delete order.customerId;
        delete order.assignedTo;

        return { ...order, customer, assignedTo };
      });

      // Count customers
      const customerCount = await Customer.countDocuments();

      //Count Products
      const productCount = await Product.countDocuments();

      // Get open orders per user using global helper
      const usersWithOpenOrders = await getUsersWithOpenOrders();

      const success_msg = req.session.success_msg || null;
      delete req.session.success_msg; // clear after reading

      res.render("admin/dashboard", {
        layout: "admin",
        orders,
        customerCount,
        productCount,
        usersWithOpenOrders,
        success_msg,
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async analytics(req, res) {
    try {
      res.render("admin/analytics", { layout: "admin" });
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
  async productsData(req, res) {
    try {
      let start = parseInt(req.query.start) || 0;
      let length = parseInt(req.query.length) || 10;

      // Safely extract search value
      const search = req.query["search[value]"]
        ? req.query["search[value]"].trim()
        : "";

      // Extract sorting information safely
      let orderCol = req.query["order[0][column]"]
        ? parseInt(req.query["order[0][column]"])
        : 0;

      let orderDir = req.query["order[0][dir]"] || "asc";

      // Map column index to field name
      const columns = [
        "title",
        "brandLine",
        "productLine",
        "category",
        "subcategory",
      ];

      let sortField = columns[orderCol];
      if (!sortField || sortField === "index" || sortField === "options") {
        sortField = "title"; // default
      }

      // Build search query
      const query = search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { brandLine: { $regex: search, $options: "i" } },
              { productLine: { $regex: search, $options: "i" } },
              { category: { $regex: search, $options: "i" } },
              { subcategory: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      const totalRecords = await Product.countDocuments();
      const filteredRecords = await Product.countDocuments(query);

      const products = await Product.find(query)
        .sort({ [sortField]: orderDir === "asc" ? 1 : -1 })
        .skip(start)
        .limit(length)
        .lean();

      const data = products.map((p) => ({
        _id: p._id, // needed for row click
        title: p.title,
        brandLine: p.brandLine,
        productLine: p.productLine,
        category: p.category,
        subcategory: p.subcategory,
      }));

      res.json({
        draw: parseInt(req.query.draw) || 0,
        recordsTotal: totalRecords,
        recordsFiltered: filteredRecords,
        data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
  async calendar(req, res) {
    try {
      res.render("admin/calendar", {
        layout: "admin",
      });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async addEvent(req, res) {
    try {
      const { title, dateRange, time, description } = req.body;

      // Validate required fields
      if (!title || !dateRange || !time) {
        return res.status(400).send("Title, date, and time are required");
      }

      // Convert dateRange string to Date object
      const parsedDate = new Date(dateRange);
      if (isNaN(parsedDate)) {
        return res.status(400).send("Invalid date format");
      }

      // Create new Event instance
      const newEvent = new Event({
        title,
        dateRange: parsedDate,
        time,
        description,
      });

      // Save event to DB
      await newEvent.save();

      // Redirect to calendar or another admin page
      res.redirect("/admin/calendar");
    } catch (err) {
      console.error("Error adding event:", err);
      res.render("error/404", { layout: "error" });
    }
  },
  async events(req, res) {
    try {
      const events = await Event.find().lean();

      const calendarEvents = events.map((ev) => {
        const dateStr = ev.dateRange
          ? ev.dateRange.toISOString().split("T")[0]
          : null;
        const timeStr = convertTimeTo24(ev.time); // safe now

        return {
          id: ev._id,
          title: ev.title,
          start: dateStr ? `${dateStr}T${timeStr}` : null,
          description: ev.description || "",
        };
      });

      res.json(calendarEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  },
  async getEvents(req, res) {
    try {
      const events = await Event.find().lean();

      const calendarEvents = events.map((ev) => {
        // Combine dateRange (Date) + time (string) into one ISO datetime
        const date = new Date(ev.dateRange);
        if (ev.time) {
          let [hours, minutes] = ev.time.split(":");
          const isPM = ev.time.toLowerCase().includes("pm");
          hours = parseInt(hours);
          minutes = parseInt(minutes || 0);
          if (isPM && hours < 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
          date.setHours(hours, minutes, 0, 0);
        }

        return {
          id: ev._id,
          title: ev.title,
          start: date.toISOString(),
          description: ev.description || "",
        };
      });

      res.json(calendarEvents);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch events" });
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
  async viewCustomer(req, res) {
    try {
      const { ID } = req.params;

      // Find the customer
      const customer = await Customer.findById(ID).lean();
      if (!customer) {
        return res.status(404).render("error/404", { layout: "error" });
      }

      // Find all orders associated with this customer
      const orders = await Order.find({ customerId: ID })
        .sort({ createdAt: -1 })
        .lean();

      res.render("admin/viewCustomer", {
        layout: "admin",
        customer,
        orders, // pass orders to template
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async editCustomer(req, res) {
    try {
      const customerId = req.params.ID;

      let {
        companyName,
        custID,
        firstName,
        lastName,
        mobile,
        email,
        address1,
        address2,
        city,
        state,
        zip,
      } = req.body;

      if (!companyName || companyName.trim() === "") {
        companyName = "Individual";
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        {
          companyName,
          custID,
          firstName,
          lastName,
          mobile,
          email,
          address1,
          address2,
          city,
          state,
          zip,
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedCustomer) {
        return res.status(404).send("Customer not found");
      }

      res.render("admin/viewCustomer", {
        layout: "admin",
        customer: updatedCustomer,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
  async contacts(req, res) {
    try {
      const success_msg = req.session.success_msg || null;
      delete req.session.success_msg; // clear after reading

      const error_msg = req.session.error_msg || null;
      delete req.session.error_msg; // clear after reading

      const contacts = await User.find(
        {},
        "_id firstName lastName mobile email position role"
      )
        .sort({ firstName: 1 })
        .lean();

      res.render("admin/contacts", {
        layout: "admin",
        contacts,
        success_msg,
        error_msg,
      });
    } catch (err) {
      console.log(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async addNewUser(req, res) {
    try {
      const { firstName, lastName, email, mobile, position, role, password } =
        req.body;

      const newUser = new User({
        firstName,
        lastName,
        email,
        mobile,
        position,
        role,
        password,
      });

      await newUser.save();

      req.session.success_msg = `New team member created successfully`;
      res.redirect("/admin/contacts");
    } catch (err) {
      console.error(err);

      // Handle duplicate email or validation errors
      if (err.code === 11000) {
        req.session.error_msg = `Email already exists`;

        return res.redirect("/admin/contacts");
      }

      req.session.error_msg = `Error creating user`;

      res.redirect("/admin/contacts");
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

      req.session.success_msg = `Product Deleted`;
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

      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async openOrders(req, res) {
    try {
      // Fetch all active (non-archived) orders with open status
      let orders = await Order.find({
        status: { $nin: ["Completed", "Void"] },
        archived: false,
      })
        .populate("customerId")
        .populate("assignedTo")
        .lean();

      // Restructure orders to separate customer and assignedTo objects
      orders = orders.map((order) => {
        const customer = order.customerId;
        const assignedTo = order.assignedTo || null; // might be unassigned
        delete order.customerId;
        delete order.assignedTo;

        return { ...order, customer, assignedTo };
      });

      res.render("admin/openOrders", {
        layout: "admin",
        orders, // each order now has separate 'customer' and 'assignedTo' objects
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async orderHistory(req, res) {
    try {
      // Fetch all orders to date
      let orders = await Order.find({})
        .populate("customerId") // full customer document
        .populate("assignedTo") // get sales rep info
        .lean();

      // Restructure orders to separate customer and assignedTo objects
      orders = orders.map((order) => {
        const customer = order.customerId;
        const assignedTo = order.assignedTo || null; // might be unassigned
        delete order.customerId;
        delete order.assignedTo;

        return { ...order, customer, assignedTo };
      });

      res.render("admin/orderHistory", {
        layout: "admin",
        orders, // each order now has separate 'customer' and 'assignedTo' objects
      });
    } catch (err) {
      console.error(err);
      res.render("error/404", { layout: "error" });
    }
  },
  async voidOrder(req, res) {
    try {
      const orderId = req.params.id;
      const performedBy = req.user._id; // assuming you have current admin in req.user

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Soft delete: mark as archived and status as voided
      order.archived = true;
      order.status = "Voided";

      // Add activity log entry
      order.activityLog.push({
        action: "Voided",
        description: `Order voided by user ${performedBy}`,
        performedBy,
      });

      await order.save();

      // Redirect back to orders page
      res.redirect("/admin/openOrders");
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
