// const mongoose = require("mongoose");
// const fs = require("fs");
// const path = require("path");
// const Product = require("../models/Product"); // Adjust path to your Product model

// // Replace with your actual MongoDB connection string
// const MONGODB_URI =
//   "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";

// async function seed() {
//   try {
//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ Connected to MongoDB");

//     // Drop the entire database (or you can drop just products collection)
//     await mongoose.connection.db.dropDatabase();
//     console.log("🗑️ Database dropped");

//     // Read your JSON products file
//     const productsPath = path.join(__dirname, "products_updated.json");
//     const rawData = fs.readFileSync(productsPath, "utf-8");
//     const products = JSON.parse(rawData);

//     // Insert all products
//     await Product.insertMany(products);
//     console.log(`🌱 Seeded ${products.length} products`);

//     await mongoose.disconnect();
//     console.log("🛑 Disconnected from MongoDB");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error seeding database:", err);
//     process.exit(1);
//   }
// }

// seed();

//===================================
// const mongoose = require("mongoose");
// const fs = require("fs");
// const path = require("path");
// const Product = require("../models/Product"); // Adjust path to your Product model

// // Replace with your actual MongoDB connection string
// const MONGODB_URI =
//   "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";

// async function seed() {
//   try {
//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ Connected to MongoDB");

//     // Read your JSON products file
//     const productsPath = path.join(__dirname, "products.json");
//     const rawData = fs.readFileSync(productsPath, "utf-8");
//     let products = JSON.parse(rawData);

//     // Remove _id from each product so MongoDB generates a new one
//     products = products.map(({ _id, ...rest }) => rest);

//     // Insert all products
//     await Product.insertMany(products);
//     console.log(`🌱 Seeded ${products.length} new products`);

//     await mongoose.disconnect();
//     console.log("🛑 Disconnected from MongoDB");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error seeding database:", err);
//     process.exit(1);
//   }
// }

// seed();
//"mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci"
const mongoose = require("mongoose");
const Product = require("../models/Product"); // adjust path if needed

const MONGODB_URI =
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";

async function removeDuplicateTitles() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Aggregate duplicate titles
    const duplicates = await Product.aggregate([
      {
        $group: {
          _id: "$title", // group by title
          ids: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } }, // only duplicates
    ]);

    console.log(`Found ${duplicates.length} duplicate titles`);

    // Remove duplicates but keep one of each
    for (const doc of duplicates) {
      const idsToRemove = doc.ids.slice(1); // keep the first, remove rest
      await Product.deleteMany({ _id: { $in: idsToRemove } });
      console.log(
        `Removed ${idsToRemove.length} duplicates for title: ${doc._id}`
      );
    }

    console.log("✅ Finished removing duplicates");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error removing duplicates:", err);
    process.exit(1);
  }
}

removeDuplicateTitles();
