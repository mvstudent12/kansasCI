const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
  itemNumber: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  details: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  imageName: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "",
  },
  subCategory: {
    type: String,
    default: "",
  },
  productSubCategory: {
    type: String,
    default: "",
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
