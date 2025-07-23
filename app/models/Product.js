const mongoose = require("mongoose");
const { Schema } = mongoose;

// Product Schema
const ProductSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true }, // Internal product ID
  category: {
    type: String,
    required: true,
  },
  description: String,
  images: [String], // URLs or file paths
  price: { type: Number, required: true },
  tags: [String], // searchable tags
  inStock: { type: Boolean, default: true },
  variants: [
    {
      name: String, // e.g., "Color", "Size"
      options: [String], // e.g., ["Red", "Blue"]
    },
  ],
  attributes: mongoose.Schema.Types.Mixed, // flexible field for category-specific attributes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Optional: auto-update `updatedAt` on save
ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
