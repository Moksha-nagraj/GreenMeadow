// server/controllers/feedController.js
const db = require("../models/db");

exports.getFeedRecords = async (req, res) => {
  try {
    const query = req.params.cowId
      ? `SELECT f.*, c.cow_control_number, u.username as recorded_by 
         FROM feed_monitoring f
         JOIN cows c ON f.cow_id = c.cow_id
         LEFT JOIN users u ON f.user_id = u.user_id
         WHERE f.cow_id = ?
         ORDER BY f.date DESC, f.time_given DESC`
      : `SELECT f.*, c.cow_control_number, u.username as recorded_by 
         FROM feed_monitoring f
         JOIN cows c ON f.cow_id = c.cow_id
         LEFT JOIN users u ON f.user_id = u.user_id
         ORDER BY f.date DESC, f.time_given DESC`;

    const params = req.params.cowId ? [req.params.cowId] : [];

    const [records] = await db.query(query, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFeedRecord = async (req, res) => {
  const { cow_id, date, food_item, quantity, time_given, remarks, user_id } =
    req.body;

  try {
    const result = await db.query(
      `INSERT INTO feed_monitoring 
       (cow_id, date, food_item, quantity, time_given, remarks, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cow_id, date, food_item, quantity, time_given, remarks, user_id]
    );

    res.status(201).json({
      message: "Feed record added",
      recordId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFeedRecord = async (req, res) => {
  const { date, food_item, quantity, time_given, remarks } = req.body;

  try {
    await db.query(
      `UPDATE feed_monitoring 
       SET date = ?, food_item = ?, quantity = ?, time_given = ?, remarks = ?
       WHERE feed_id = ?`,
      [date, food_item, quantity, time_given, remarks, req.params.id]
    );

    res.json({ message: "Feed record updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFeedRecord = async (req, res) => {
  try {
    await db.query("DELETE FROM feed_monitoring WHERE feed_id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Feed record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedConsumptionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await db.query(
      `
      SELECT 
        food_item,
        SUM(quantity) as total_quantity,
        COUNT(*) as feeding_count
      FROM feed_monitoring
      WHERE date BETWEEN ? AND ?
      GROUP BY food_item
      ORDER BY total_quantity DESC
    `,
      [startDate, endDate]
    );

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
