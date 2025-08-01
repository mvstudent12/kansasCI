const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, default: "Misc" },
  lineType: { type: String, default: "Uncategorized" },
  description: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  price: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  tags: [String],
  attributes: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
