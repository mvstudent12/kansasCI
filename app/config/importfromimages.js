// scripts/importFromImages.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product");

async function main() {
  await mongoose.connect(
    "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  // Drop obsolete unique index on variants.sku if exists
  try {
    await Product.collection.dropIndex("variants.sku_1");
    console.log("✅ Dropped obsolete index variants.sku_1");
  } catch (err) {
    if (err.codeName === "IndexNotFound") {
      console.log("ℹ️ variants.sku_1 index not found, nothing to drop.");
    } else {
      console.error("❌ Error dropping index variants.sku_1:", err);
    }
  }

  await Product.collection.dropIndex("sku_1").catch((err) => {
    if (err.codeName !== "IndexNotFound")
      console.error("Failed to drop sku index:", err);
    else console.log("sku index already removed");
  });

  // Clear existing products
  await Product.deleteMany({});
  console.log("🗑️ Cleared existing products from database.");

  const imageFolder = path.join(__dirname, "../config/product-images");
  const files = fs.readdirSync(imageFolder);

  for (const file of files) {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).replace(/[_-]/g, " ");
    const imageUrl = `/img/product-images/${file}`;

    const product = new Product({
      title: baseName,
      category: guessCategory(baseName),
      lineType: guessLineType(baseName),
      imageUrl,
      price: 0,
      description: "",
    });

    try {
      await product.save();
      console.log(`✔️ Saved: ${baseName}`);
    } catch (err) {
      console.error(`❌ Error saving ${baseName}:`, err.message);
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("💥 Script failed:", err);
  mongoose.disconnect();
});

// Helper functions for category and lineType guessing
function guessCategory(name) {
  if (/desk/i.test(name)) return "Desks";
  if (/table/i.test(name)) return "Tables";
  if (/chair/i.test(name)) return "Chairs";
  return "Misc";
}

function guessLineType(name) {
  if (/worksimpli/i.test(name)) return "Worksimpli";
  if (/classic laminate/i.test(name)) return "Classic Laminate";
  return "Uncategorized";
}
