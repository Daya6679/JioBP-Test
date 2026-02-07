import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const DriverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseValidity: { type: Date, required: true },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    image: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your User model is named "User"
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
