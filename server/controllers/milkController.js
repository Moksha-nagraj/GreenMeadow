// server/controllers/milkController.js
const db = require("../models/db");

// Milk Collection
exports.getMilkCollections = async (req, res) => {
  try {
    const query = req.params.cowId
      ? "SELECT * FROM milk_collection WHERE cow_id = ? ORDER BY date DESC"
      : "SELECT * FROM milk_collection ORDER BY date DESC";

    const params = req.params.cowId ? [req.params.cowId] : [];

    const [collections] = await db.query(query, params); // ✅ Destructure first element
    res.json(collections); // ✅ Send only data
  } catch (err) {
    console.error("Error fetching milk collections:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addMilkCollection = async (req, res) => {
  const {
    cow_id,
    date,
    morning_liters,
    evening_liters,
    price_per_liter,
    user_id,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO milk_collection 
       (cow_id, date, morning_liters, evening_liters, price_per_liter, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cow_id, date, morning_liters, evening_liters, price_per_liter, user_id]
    );

    res.status(201).json({
      message: "Milk collection recorded",
      collectionId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMilkCollection = async (req, res) => {
  const { date, morning_liters, evening_liters, price_per_liter } = req.body;

  try {
    await db.query(
      `UPDATE milk_collection 
       SET date = ?, morning_liters = ?, evening_liters = ?, price_per_liter = ?
       WHERE collection_id = ?`,
      [date, morning_liters, evening_liters, price_per_liter, req.params.id]
    );

    res.json({ message: "Milk collection updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMilkCollection = async (req, res) => {
  try {
    await db.query("DELETE FROM milk_collection WHERE collection_id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Milk collection deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Milk Sales
exports.getMilkSales = async (req, res) => {
  try {
    const sales = await db.query(`
      SELECT ms.*, u.username as recorded_by 
      FROM milk_sales ms
      LEFT JOIN users u ON ms.user_id = u.user_id
      ORDER BY date DESC
    `);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMilkSale = async (req, res) => {
  const { date, liters_sold, price_per_liter, customer_name, user_id } =
    req.body;

  try {
    const total = liters_sold * price_per_liter;

    const result = await db.query(
      `INSERT INTO milk_sales 
       (date, liters_sold, price_per_liter, total, customer_name, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, liters_sold, price_per_liter, total, customer_name, user_id]
    );

    res.status(201).json({
      message: "Milk sale recorded",
      saleId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMilkSale = async (req, res) => {
  const { date, liters_sold, price_per_liter, customer_name } = req.body;

  try {
    const total = liters_sold * price_per_liter;

    await db.query(
      `UPDATE milk_sales 
       SET date = ?, liters_sold = ?, price_per_liter = ?, total = ?, customer_name = ?
       WHERE sale_id = ?`,
      [date, liters_sold, price_per_liter, total, customer_name, req.params.id]
    );

    res.json({ message: "Milk sale updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMilkSale = async (req, res) => {
  try {
    await db.query("DELETE FROM milk_sales WHERE sale_id = ?", [req.params.id]);

    res.json({ message: "Milk sale deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Milk Reports
exports.getMilkProductionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await db.query(
      `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(total) as total_liters,
        AVG(price_per_liter) as avg_price,
        SUM(total * price_per_liter) as total_value
      FROM milk_collection
      WHERE date BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month
    `,
      [startDate, endDate]
    );

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
