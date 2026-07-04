import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    originalId: Number,
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: String,
    price: Number,
    originalPrice: Number,
    discount: Number,
    rating: Number,
    reviewCount: Number,
    stock: Number,
    images: [String],
    description: String,
    features: [String],
    brand: String,
    tags: [String],
    isFeatured: Boolean,
    isTrending: Boolean,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
