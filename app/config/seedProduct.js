const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Product = require("../models/Product"); // Adjust as needed

mongoose
  .connect("mongodb://localhost/kansasci", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const workbook = xlsx.readFile("./products.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

// Optional: Clean up or normalize categories to match schema enum
function cleanCategory(raw) {
  if (!raw) return "Furniture"; // fallback
  const category = raw.trim();
  const allowed = [
    "Seating",
    "Furniture",
    "Office Panels",
    "Janitorial Products",
    "Chemical",
    "Paint",
    "Clothing",
    "Textiles",
    "Metal Products",
    "Signs & Graphics",
    "Awards & Plaques",
    "Software Solutions",
  ];
  if (allowed.includes(category)) return category;
  if (category === "Clothing/Textiles") return "Clothing"; // Adjust if needed
  console.warn("⚠️ Unknown category:", category, "- defaulting to Furniture");
  return "Furniture";
}

async function seedProducts() {
  try {
    await mongoose.connection.dropDatabase();
    console.log("🗑️ Database dropped successfully");

    const products = rows.map((row) => ({
      name: row.name || "Unnamed Product",
      sku: row.itemNumber || "",
      category: cleanCategory(row.category),
      description: row.details || "",
      images: row.imageName ? [row.imageName] : [],
      price: parseFloat(row.price) || 0,
      tags: [], // You can populate this later from subcategory or name
      inStock: true,
      variants: [], // No variant info present yet
      attributes: {
        subCategory: row.subCategory || "",
        productCategory: row.productCategory || "",
        productSubCategory: row.productSubCategory || "",
        details: row.details || "",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await Product.insertMany(products);
    console.log("🌱 Products seeded successfully");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedProducts();
