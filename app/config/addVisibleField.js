const mongoose = require("mongoose");
const Product = require("../models/Product"); // adjust path to your Product model

// 🔧 Replace with your MongoDB connection string
const MONGO_URI =
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB ✅");

    // Update all products that don't have the "visible" field
    const result = await Product.updateMany(
      { visible: { $exists: false } }, // only update if "visible" is missing
      { $set: { visible: true } } // add visible:true
    );

    console.log(`Updated ${result.modifiedCount} products 🚀`);

    // Close connection
    await mongoose.connection.close();
    console.log("Done, connection closed");
  } catch (err) {
    console.error("Error updating products:", err);
    process.exit(1);
  }
})();
