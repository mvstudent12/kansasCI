// dropUserSchema.js
const mongoose = require("mongoose");

(async () => {
  try {
    // 1️⃣ Connect to your MongoDB
    await mongoose.connect(
      "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("✅ Connected to MongoDB");

    // 2️⃣ Drop the 'users' collection if it exists
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const userCollection = collections.find((c) => c.name === "users");

    if (userCollection) {
      await mongoose.connection.db.dropCollection("users");
      console.log("🗑️  'users' collection dropped successfully!");
    } else {
      console.log("ℹ️  No 'users' collection found — nothing to drop.");
    }

    // 3️⃣ Close connection
    await mongoose.disconnect();
    console.log("🔒 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error dropping user schema:", err);
    process.exit(1);
  }
})();
