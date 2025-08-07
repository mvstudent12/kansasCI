const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    brandLine: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    colors: {
      type: [String], // store colors as array of strings
    },
    sizes: {
      type: [String], // store colors as array of strings
    },
    dimensions: {
      type: String,
    },
    productLine: {
      type: String,
      enum: ["none", "signature", "director", "executive"], // restrict possible values
      default: "none",
    },
    description: {
      type: String,
    },
    details: {
      type: String,
    },
    images: [
      {
        originalName: String,
        fileName: String,
        path: String,
        size: Number,
        mimetype: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
