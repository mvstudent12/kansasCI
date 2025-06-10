const mongoose = require("mongoose");
require("dotenv").config();

//const dbURI = process.env.MONGO_URI; //for production

//const dbURI = "mongodb://localhost/kansasci";

const dbURI =
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci";

mongoose
  .connect(dbURI, {
    //comment these three out in localhost development vvv
    ssl: true, // Ensure SSL is enabled -comment out in development/localhost all three lines
    tls: true, // Force TLS connection
    tlsInsecure: false, // Optionally, enforce secure connection (recommended)
  })
  .then(() => console.log(`Connected to ${dbURI}`))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

mongoose.connection.on("connected", () => {
  console.log(`Mongoose connected to ${dbURI}`);
});
mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log(" Mongoose disconnected");
});

//Graceful shutdown of connection
const gracefulShutdown = async (msg, callback) => {
  try {
    await mongoose.connection.close();
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  } catch (error) {
    console.error(`Error during mongoose shutdown: ${error.message}`);
    callback(error); // In case you want to handle the error
  }
};

// For app termination
process.on("SIGINT", () => {
  gracefulShutdown("app termination", () => {
    process.exit(0);
  });
});
