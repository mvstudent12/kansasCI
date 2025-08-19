const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        brandLine: String,
        quantity: { type: Number, required: true },
        size: String,
        color: String,
        images: [Object], // array of image paths or objects
      },
    ],
    inspirationGallery: [{ type: String }],
    status: {
      type: String,
      enum: ["New", "Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
