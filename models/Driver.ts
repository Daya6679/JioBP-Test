import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    licenseValidity: { type: Date, required: true },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Driver ||
  mongoose.model("Driver", DriverSchema);
