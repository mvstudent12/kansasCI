// cleanupUnusedImages.js
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// import your Product model
const Product = require("../models/Product");

// change this to match your uploads folder
const uploadsDir = path.join(__dirname, "../../public/uploads");

async function cleanupImages() {
  try {
    // connect to Mongo
    await mongoose.connect(
      "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB...");

    // 1. Pull all image fileNames from the Product schema
    const products = await Product.find({}, { images: 1, _id: 0 });

    const validImagePaths = new Set();

    products.forEach((product) => {
      if (Array.isArray(product.images)) {
        product.images.forEach((img) => {
          if (img?.fileName) {
            validImagePaths.add(img.fileName);
          }
        });
      }
    });

    console.log(`Collected ${validImagePaths.size} valid images from DB.`);

    // 2. Read all files in uploads folder
    const files = fs.readdirSync(uploadsDir);

    let deleted = 0;
    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);

      // ✅ make sure it's really in uploads and exists before deleting
      if (!validImagePaths.has(file) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted++;
        console.log(`Deleted unused file: ${file}`);
      }
    });

    console.log(`Cleanup complete. Deleted ${deleted} unused files.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}

cleanupImages();
