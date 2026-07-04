import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  status: { type: String, default: "active" },
  cancelledAt: Date,
});

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema],
    total: Number,
    status: String,
    shippingAddress: Object,
    paymentMethod: String,
    createdAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.virtual("userId").get(function () {
  if (!this.user) return undefined;
  if (typeof this.user === "object" && this.user._id) {
    return this.user._id.toString();
  }
  return this.user.toString();
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
