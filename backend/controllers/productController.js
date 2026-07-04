import Product from "../models/Product.js";
import mongoose from "mongoose";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeProductPayload = (data) => {
  const { imageUrl, images, ...rest } = data;
  const normalizedImages = Array.isArray(images) && images.length > 0
    ? images
    : imageUrl?.trim()
      ? [imageUrl.trim()]
      : Array.isArray(images)
        ? images
        : undefined;

  return {
    ...rest,
    ...(normalizedImages ? { images: normalizedImages } : {}),
  };
};

export const getProducts = async (req, res) => {
  const { category, featured, trending, exclude, search } = req.query;
  const filter = {};

  if (category) {
    filter.category = category;
  }
  if (featured === "true") {
    filter.isFeatured = true;
  }
  if (trending === "true") {
    filter.isTrending = true;
  }
  if (exclude && mongoose.isValidObjectId(exclude)) {
    filter._id = { $ne: exclude };
  }
  if (search?.trim()) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ data: products, success: true });
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id) || await Product.findOne({ slug: id });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ data: product, success: true });
};

export const createProduct = async (req, res) => {
  const data = normalizeProductPayload(req.body);
  if (!data.slug && data.name) {
    data.slug = slugify(data.name);
  }

  const product = await Product.create(data);
  res.status(201).json({ data: product, success: true });
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = normalizeProductPayload(req.body);
  const product = await Product.findByIdAndUpdate(id, updates, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ data: product, success: true });
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ success: true });
};
