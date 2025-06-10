const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Product = require("../models/Product"); // adjust the path if needed

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost/kansasci", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
const workbook = xlsx.readFile("./products.xlsx"); // path to your Excel file
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

async function seedProducts() {
  try {
    // Delete the existing database before seeding
    await mongoose.connection.dropDatabase();
    console.log("Database dropped successfully");

    const products = rows.map((row) => ({
      product: row.product,
      name: row.name || "",
      itemNumber: row.itemNumber || "",
      description: row.description || "",
      details: row.details || "",
      price: parseFloat(row.price) || 0,
      imageName: row.imageName || "",
      category: row.category || "",
      subCategory: row.subCategory || "",
      productSubCategory: row.productSubCategory || "",
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
