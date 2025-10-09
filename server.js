// server.js

const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const path = require("path");
const dotenv = require("dotenv");

// links database api
require("./app/config/db");

// Load environment variables
dotenv.config();

const app = express();

// handlebars helpers
const helpers = require("./app/helpers/helpers");

// Handlebars setup
app.engine(
  "handlebars",
  exphbs.engine({
    helpers: helpers,
    // Register the partials directory
    partialsDir: path.join(__dirname, "views/partials"),
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts",
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// app.enable("view cache"); --enable in production

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//session setup
require("./app/config/session")(app);

// Static files
app.use(
  express.static("public", {
    maxage: "30d",
    etag: false,
  })
);

//Graceful Shutdown for Database
const { setupShutdownHandlers } = require("./app/utils/gracefulShutdown");

// Routes
const publicRoutes = require("./app/routes/public.routes");
const shopRoutes = require("./app/routes/shop.routes");
const adminRoutes = require("./app/routes/admin.routes");

const User = require("./app/models/User");

// --- Public/Shop Middleware ---
const publicMiddleware = require("./app/middleware/publicMiddleware");
app.use(["/", "/shop"], publicMiddleware);

// --- Auth Routes ---
const authRoutes = require("./app/routes/auth.routes");
app.use("/auth", authRoutes);

// --- Admin Middleware with cached sales contacts ---
const adminMiddleware = require("./app/middleware/adminMiddleware");
app.use("/admin", adminMiddleware);

// Use routes
app.use("/", publicRoutes);
app.use("/shop", shopRoutes);
app.use("/admin", adminRoutes);

// 404 route
app.use((req, res) => {
  res.status(404).render("error/503", { layout: "error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// For graceful app termination
setupShutdownHandlers();

module.exports = app; // for testing
