const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
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
      unique: true,
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
    position: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // passwordHash: { type: String },
    role: {
      type: String,
      enum: ["admin"], // only "admin" allowed
      default: "admin", // always set to admin by default
      immutable: true, // prevents it from being changed after creation
      required: true,
    },
  },
  { timestamps: true }
);

// 🔒 Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Method to compare password on login
userSchema.methods.isValidPassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
