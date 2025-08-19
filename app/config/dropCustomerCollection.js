const mongoose = require("mongoose");

async function dropCustomerCollection() {
  try {
    await mongoose.connect(
      "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    const collectionExists = await mongoose.connection.db
      .listCollections({ name: "customers" })
      .hasNext();

    if (collectionExists) {
      await mongoose.connection.collection("customers").drop();
      console.log("Customer collection dropped successfully.");
    } else {
      console.log("Customer collection does not exist.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error dropping Customer collection:", err);
  }
}

dropCustomerCollection();
