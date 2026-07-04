import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    originalId: Number,
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    image: String,
    productCount: Number,
    description: String,
    color: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
