import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
});

const userSchema = new mongoose.Schema(
  {
    originalId: Number,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    avatar: String,
    phone: String,
    address: addressSchema,
    joinedAt: Date,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const User = mongoose.model("User", userSchema);
export default User;
