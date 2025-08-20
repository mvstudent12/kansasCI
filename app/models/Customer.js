const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    customerType: { type: String, required: true },
    custID: { type: String, default: null },
    companyName: {
      type: String,
      default: "Individual",
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
