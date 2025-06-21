// server/controllers/categoriesController.js
const db = require("../models/db");

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM cow_categories");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await db.query(
      "SELECT * FROM cow_categories WHERE category_id = ?",
      [req.params.id]
    );
    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  const { category_name, description } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO cow_categories (category_name, description) VALUES (?, ?)",
      [category_name, description]
    );
    res.status(201).json({
      message: "Category created",
      categoryId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { category_name, description } = req.body;
  try {
    await db.query(
      "UPDATE cow_categories SET category_name = ?, description = ? WHERE category_id = ?",
      [category_name, description, req.params.id]
    );
    res.json({ message: "Category updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const cows = await db.query(
      "SELECT COUNT(*) as count FROM cows WHERE category_id = ?",
      [req.params.id]
    );

    if (cows[0].count > 0) {
      return res.status(400).json({
        message: "Cannot delete category as it is assigned to cows",
      });
    }

    await db.query("DELETE FROM cow_categories WHERE category_id = ?", [
      req.params.id,
    ]);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
