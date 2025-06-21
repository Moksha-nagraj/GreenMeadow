// server/controllers/salesController.js
const db = require("../models/db");

exports.getCowSales = async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT cs.*, c.cow_control_number, u.username as recorded_by 
      FROM cow_sales cs
      JOIN cows c ON cs.cow_id = c.cow_id
      LEFT JOIN users u ON cs.user_id = u.user_id
      ORDER BY cs.date DESC
    `);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCowSale = async (req, res) => {
  const {
    cow_id,
    date,
    amount,
    customer_name,
    customer_contact,
    remarks,
    user_id,
  } = req.body;

  try {
    await db.query("START TRANSACTION");

    const result = await db.query(
      `INSERT INTO cow_sales 
       (cow_id, date, amount, customer_name, customer_contact, remarks, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cow_id, date, amount, customer_name, customer_contact, remarks, user_id]
    );

    await db.query("UPDATE cows SET status = 'sold' WHERE cow_id = ?", [
      cow_id,
    ]);

    await db.query("COMMIT");

    res.status(201).json({
      message: "Cow sale recorded",
      saleId: result.insertId,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
};

exports.updateCowSale = async (req, res) => {
  const { date, amount, customer_name, customer_contact, remarks } = req.body;

  try {
    await db.query(
      `UPDATE cow_sales 
       SET date = ?, amount = ?, customer_name = ?, customer_contact = ?, remarks = ?
       WHERE cow_sale_id = ?`,
      [date, amount, customer_name, customer_contact, remarks, req.params.id]
    );

    res.json({ message: "Cow sale updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCowSale = async (req, res) => {
  try {
    const sale = await db.query(
      "SELECT cow_id FROM cow_sales WHERE cow_sale_id = ?",
      [req.params.id]
    );

    if (sale.length === 0) {
      return res.status(404).json({ message: "Sale record not found" });
    }

    await db.query("START TRANSACTION");

    await db.query("DELETE FROM cow_sales WHERE cow_sale_id = ?", [
      req.params.id,
    ]);

    await db.query("UPDATE cows SET status = 'active' WHERE cow_id = ?", [
      sale[0].cow_id,
    ]);

    await db.query("COMMIT");

    res.json({ message: "Cow sale deleted and cow status reset" });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await db.query(
      `
      SELECT 
        'milk' as type,
        COUNT(*) as count,
        SUM(liters_sold) as total_quantity,
        SUM(total) as total_amount
      FROM milk_sales
      WHERE date BETWEEN ? AND ?

      UNION ALL

      SELECT 
        'cow' as type,
        COUNT(*) as count,
        COUNT(*) as total_quantity,
        SUM(amount) as total_amount
      FROM cow_sales
      WHERE date BETWEEN ? AND ?
    `,
      [startDate, endDate, startDate, endDate]
    );

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
