const Product = require("../models/Product");

async function loadAllCategories(req, res, next) {
  try {
    const allCategories = await Product.distinct("category");
    res.locals.allCategories = allCategories;
    next();
  } catch (err) {
    next(err);
  }
}

// Apply this middleware to your shop/product routes:
app.use("/shop", loadAllCategories);
app.use("/products", loadAllCategories);
