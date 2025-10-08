const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// ✅ Import your User model
const User = require("../models/User");

// ✅ Path to your users.json file
const usersFilePath = path.join(__dirname, "users.json");

// ✅ MongoDB connection URI
const MONGO_URI =
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority";

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // 🔹 Read and parse users.json
    const rawData = fs.readFileSync(usersFilePath, "utf-8");
    const users = JSON.parse(rawData);

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error("users.json must contain a non-empty array of users");
    }

    // 🔹 Optional: clear existing users before seeding
    await User.deleteMany({});
    console.log("🗑️  Existing users deleted");

    // 🔹 Insert new users
    const inserted = await User.insertMany(users);
    console.log(`✅ Successfully seeded ${inserted.length} users`);

    await mongoose.disconnect();
    console.log("🔒 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error seeding users:", err.message);
    process.exit(1);
  }
})();
