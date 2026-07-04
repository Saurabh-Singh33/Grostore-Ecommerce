import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find({});
  res.json({ data: categories, success: true });
};

export const createCategory = async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ data: cat, success: true });
};
