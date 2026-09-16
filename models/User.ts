import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'USER' },
  },
  { timestamps: true },
);

// Prevents re-defining the model during hot-reloads
export default mongoose.models.User || mongoose.model('User', UserSchema);
