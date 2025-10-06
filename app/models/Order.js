const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activityLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "Order Created",
        "Assigned",
        "Reassigned",
        "Status Updated",
        "Customer Contacted",
        "Note Added",
        "Completed",
      ],
    },
    description: { type: String, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const assignmentHistorySchema = new Schema(
  {
    salesRep: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedAt: { type: Date, default: Date.now },
    unassignedAt: { type: Date },
  },
  { _id: false }
);

const orderNoteSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    replies: [
      {
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    cartItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        title: String,
        brandLine: String,
        quantity: { type: Number, required: true },
        size: String,
        color: String,
        images: [Object],
      },
    ],

    inspirationGallery: [{ type: String }],

    // 🔹 current assignment
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    // 🔹 full history of assignments
    assignmentHistory: [assignmentHistorySchema],

    // 🔹 lifecycle stage
    status: {
      type: String,
      enum: [
        "New",
        "Assigned",
        "In Progress",
        "Awaiting Customer",
        "Pending",
        "Completed",
        "Cancelled",
      ],
      default: "New",
    },

    // 🔹 activity log of all interactions
    activityLog: [activityLogSchema],

    // 🔹 threaded notes
    notes: [orderNoteSchema],

    // 🔹 timestamps for auditing
    assignedAt: { type: Date },
    completedAt: { type: Date },

    // 🔹 soft delete flag
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔹 Virtual: total time order has been open
orderSchema.virtual("timeOpen").get(function () {
  const end = this.completedAt || new Date();
  return end - this.createdAt; // returns milliseconds
});

// 🔹 Virtual: time in current status
orderSchema.virtual("timeInStatus").get(function () {
  const lastStatusChange = this.activityLog
    .filter((a) => a.action === "Status Updated")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  const start = lastStatusChange ? lastStatusChange.timestamp : this.createdAt;
  const end = this.completedAt || new Date();

  return end - start; // milliseconds
});

// Make virtuals show up when converting to JSON
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);
