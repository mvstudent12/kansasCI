const mongoose = require("mongoose");
const { Schema } = mongoose;

// Variant Schema (embedded)
const VariantSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    color: String,
    size: String,
    material: String,
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    image: String,
  },
  { _id: false }
); // No _id for embedded docs unless needed

// Product Schema
const ProductSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  brand: String,
  category: { type: String, required: true },
  tags: [String],
  images: [String],
  basePrice: Number,
  variants: [VariantSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Optional: auto-update `updatedAt` on save
ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
