// server.js
const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const path = require("path");
const dotenv = require("dotenv");

//links database api
require("./app/config/db");

// Load environment variables
dotenv.config();

const app = express();

//handlebars helpers
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

const session = require("express-session"); //initialize express-sessions
const MongoStore = require("connect-mongo"); // This stores sessions in MongoDB
const crypto = require("crypto"); //generates random session secret

//const dbURI = "mongodb://localhost/kansasci";

const dbURI =
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";

// Generate a random session secret dynamically
const generateSessionSecret = () => {
  return crypto.randomBytes(32).toString("hex"); // Generates a 64-character secret
};

// Use the generated session secret
//const sessionSecret = generateSessionSecret();

const sessionSecret = "asdasdasd8798798798279827342kmnikjn89s8ed0s8d";

app.use(
  session({
    secret: sessionSecret, // Use a strong, unique secret key for session ,encryption
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: dbURI, // MongoDB URI
      collectionName: "sessions", // Collection name for storing sessions in MongoDB
    }),
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, // 1 day
      secure: false, //set true only in production
      httpOnly: true, // Set 'secure: true' if you're using HTTPS
      sameSite: "strict", // Helps prevent CSRF
    },
  })
);

// Static files
app.use(express.static("public", { maxage: "30d", etag: false }));

// Routes
const publicRoutes = require("./app/routes/public.routes");
const shopRoutes = require("./app/routes/shop.routes");

// Middleware to make cart, wishList, inspirationList and counts available to all views
app.use((req, res, next) => {
  // Cart session and count
  res.locals.cart = req.session.cart || [];
  res.locals.cartCount = res.locals.cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  // Wishlist session and count
  res.locals.wishList = req.session.wishList || [];
  res.locals.wishCount = res.locals.wishList.length;

  // Inspiration / gallery session and count
  res.locals.inspirationList = req.session.inspirationList || [];
  res.locals.inspirationCount = res.locals.inspirationList.length;

  next();
});

app.use("/", publicRoutes); // public pages
app.use("/", shopRoutes); // shop pages

const adminRoutes = require("./app/routes/admin.routes");
app.use("/admin", adminRoutes);

const authRoutes = require("./app/routes/auth.routes");
app.use("/auth", authRoutes);

//404 route
app.use((req, res) => {
  res.status(404).render("error/503", { layout: "error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// For app termination
const gracefulShutdown = (msg, callback) => {
  console.log(`Application disconnected through ${msg}`);
  callback();
};
process.on("SIGINT", () => {
  gracefulShutdown("App termination", () => {
    process.exit(0);
  });
});

module.exports = app; // for testing
