const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product"); // adjust path if needed

// MongoDB connection string
const MONGODB_URI =
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";

// Output file path
const OUTPUT_FILE = path.join(__dirname, "products.json");

async function exportProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected.");

    console.log("Fetching products...");
    const products = await Product.find({}).lean(); // .lean() gives plain JS objects
    console.log(`Fetched ${products.length} products.`);

    console.log(`Saving to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2), "utf-8");
    console.log("Export complete!");
  } catch (err) {
    console.error("Error exporting products:", err);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

exportProducts();
