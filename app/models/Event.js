const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dateRange: { type: Date, required: true }, // store a real date
    time: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
