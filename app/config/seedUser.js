const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Adjust path if needed

//const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kansasci";

const MONGO_URI =
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";
async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const usersPath = path.join(__dirname, "./user.seed.json");
    const rawData = fs.readFileSync(usersPath);
    const users = JSON.parse(rawData);

    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
        return { ...user, passwordHash: hashedPassword };
      })
    );

    await User.deleteMany({});
    await User.insertMany(hashedUsers);

    console.log(`🌱 Seeded ${hashedUsers.length} users successfully.`);
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    mongoose.disconnect();
    process.exit(1);
  }
}

seedUsers();
