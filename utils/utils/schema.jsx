import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Prevent recompilation issues in Next.js / hot reload
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
