import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    fuelType: { type: String, required: true },
    vehicleNumber: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    nickname: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming your User model is named "User"
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
