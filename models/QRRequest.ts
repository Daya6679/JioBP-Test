import mongoose from "mongoose";

const QRRequestSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    fuelType: { type: String, required: true },
    qty: { type: Number, required: true },
    amount: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    qrBase64: { type: String }, // This will store the generated image string later
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.QRRequest || mongoose.model("QRRequest", QRRequestSchema);