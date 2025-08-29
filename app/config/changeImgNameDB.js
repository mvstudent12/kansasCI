const mongoose = require("mongoose");

const Product = require("../models/Product"); // adjust path if needed

// MongoDB connection
mongoose.connect(
  "mongodb+srv://kcicodingdev:zaaKZI27u5MtY6Pw@kansasci.jdywjne.mongodb.net/?retryWrites=true&w=majority&appName=Kansasci",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function updateImageExtensions() {
  try {
    const products = await Product.find();

    for (const product of products) {
      let updated = false;

      product.images.forEach((image) => {
        ["originalName", "fileName", "path", "mimetype"].forEach((field) => {
          if (image[field]) {
            // Replace extensions in strings
            image[field] = image[field].replace(/\.(png|jpg|jpeg)$/i, ".webp");

            // For mimetype, update 'image/png' → 'image/webp'
            if (field === "mimetype") {
              image[field] = image[field].replace(
                /image\/(png|jpg|jpeg)/i,
                "image/webp"
              );
            }

            updated = true;
          }
        });
      });

      if (updated) {
        await product.save();
        console.log(`Updated product ${product._id}`);
      }
    }

    console.log("All products updated!");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

updateImageExtensions();
