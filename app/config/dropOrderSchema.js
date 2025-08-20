const mongoose = require("mongoose");

async function dropOrderCollection() {
  try {
    await mongoose.connect(
      "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    const collectionExists = await mongoose.connection.db
      .listCollections({ name: "orders" })
      .hasNext();

    if (collectionExists) {
      await mongoose.connection.collection("orders").drop();
      console.log("Order collection dropped successfully.");
    } else {
      console.log("Order collection does not exist.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error dropping Order collection:", err);
  }
}

dropOrderCollection();
