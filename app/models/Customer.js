const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  title: String,
  brandLine: String,
  quantity: { type: Number, required: true },
  price: Number, // optional: store product price at checkout
  size: String,
  color: String,
  images: [Object], // array of image paths or objects
});

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },

    // New fields from your checkout form
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    customerType: { type: String, required: true },

    cartItems: [orderItemSchema], // snapshot of products at checkout
    totalPrice: Number, // optional: total price
    status: { type: String, default: "Pending" }, // Pending, Completed, Shipped, etc.
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
