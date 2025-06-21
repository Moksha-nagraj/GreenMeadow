// server/controllers/vaccineController.js
const db = require("../models/db");

exports.getVaccineRecords = async (req, res) => {
  try {
    const query = req.params.cowId
      ? `SELECT v.*, c.cow_control_number, u.username as recorded_by 
         FROM vaccine_monitoring v
         JOIN cows c ON v.cow_id = c.cow_id
         LEFT JOIN users u ON v.user_id = u.user_id
         WHERE v.cow_id = ?
         ORDER BY v.date_given DESC`
      : `SELECT v.*, c.cow_control_number, u.username as recorded_by 
         FROM vaccine_monitoring v
         JOIN cows c ON v.cow_id = c.cow_id
         LEFT JOIN users u ON v.user_id = u.user_id
         ORDER BY v.date_given DESC`;

    const params = req.params.cowId ? [req.params.cowId] : [];

    const [records] = await db.query(query, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addVaccineRecord = async (req, res) => {
  const { cow_id, date_given, vaccine_name, remarks, user_id } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO vaccine_monitoring 
       (cow_id, date_given, vaccine_name, remarks, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [cow_id, date_given, vaccine_name, remarks, user_id]
    );

    res.status(201).json({
      message: "Vaccine record added",
      recordId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVaccineRecord = async (req, res) => {
  const { date_given, vaccine_name, remarks } = req.body;

  try {
    await db.query(
      `UPDATE vaccine_monitoring 
       SET date_given = ?, vaccine_name = ?, remarks = ?
       WHERE vaccine_id = ?`,
      [date_given, vaccine_name, remarks, req.params.id]
    );

    res.json({ message: "Vaccine record updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteVaccineRecord = async (req, res) => {
  try {
    await db.query("DELETE FROM vaccine_monitoring WHERE vaccine_id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Vaccine record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVaccineReport = async (req, res) => {
  try {
    const report = await db.query(`
      SELECT 
        vaccine_name,
        COUNT(*) as count,
        MIN(date_given) as first_date,
        MAX(date_given) as last_date
      FROM vaccine_monitoring
      GROUP BY vaccine_name
      ORDER BY count DESC
    `);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
