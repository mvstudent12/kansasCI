const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Please enter a valid mobile number (e.g., (123) 456-7890)",
      ],
    },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: {
      type: String,
      required: [true, "ZIP code is required"],
      match: [
        /^\d{5}(-\d{4})?$/,
        "ZIP code must be 5 digits or 5 digits followed by a dash and 4 digits (e.g., 12345 or 12345-6789)",
      ],
    },
    customerType: {
      type: String,
      required: [true, "Customer type is required"],
      enum: {
        values: [
          "State of KS Employee",
          "State of KS Agency",
          "Non-Profit Agency",
          "Government Agency",
          "Educational Institution",
          "Religious Organization",
        ],
        message: "Invalid customer type",
      },
    },

    custID: { type: String, default: null },
    companyName: {
      type: String,
      default: "Individual",
    },
    role: {
      type: String,
      enum: ["customer"], // only "customer" allowed
      default: "customer", // always set to customer by default
      immutable: true, // prevents it from being changed after creation
      required: true,
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
