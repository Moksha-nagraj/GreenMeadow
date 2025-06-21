// server/controllers/cowsController.js
const db = require("../models/db");

exports.getAllCows = async (req, res) => {
  try {
    const [cows] = await db.query(`
      SELECT c.*, cc.category_name, u.username as added_by 
      FROM cows c
      LEFT JOIN cow_categories cc ON c.category_id = cc.category_id
      LEFT JOIN users u ON c.user_id = u.user_id
    `);
    res.json(cows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCowById = async (req, res) => {
  try {
    const [cow] = await db.query(
      `
      SELECT c.*, cc.category_name, u.username as added_by 
      FROM cows c
      LEFT JOIN cow_categories cc ON c.category_id = cc.category_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.cow_id = ?
    `,
      [req.params.id]
    );

    if (cow.length === 0) {
      return res.status(404).json({ message: "Cow not found" });
    }

    res.json(cow[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCow = async (req, res) => {
  const {
    cow_control_number,
    category_id,
    cow_type,
    gender,
    dob,
    image_url,
    status = "active",
    user_id,
  } = req.body;

  try {
    const [existingCow] = await db.query(
      "SELECT * FROM cows WHERE cow_control_number = ?",
      [cow_control_number]
    );

    if (existingCow.length > 0) {
      return res
        .status(400)
        .json({ message: "Cow control number already exists" });
    }

    const result = await db.query(
      `INSERT INTO cows 
       (cow_control_number, category_id, cow_type, gender, dob, image_url, status, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cow_control_number,
        category_id,
        cow_type,
        gender,
        dob,
        image_url,
        status,
        user_id,
      ]
    );

    res.status(201).json({
      message: "Cow added",
      cowId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCow = async (req, res) => {
  const {
    cow_control_number,
    category_id,
    cow_type,
    gender,
    dob,
    image_url,
    status,
  } = req.body;

  try {
    await db.query(
      `UPDATE cows 
       SET cow_control_number = ?, category_id = ?, cow_type = ?, gender = ?, 
           dob = ?, image_url = ?, status = ?
       WHERE cow_id = ?`,
      [
        cow_control_number,
        category_id,
        cow_type,
        gender,
        dob,
        image_url,
        status,
        req.params.id,
      ]
    );
    res.json({ message: "Cow updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCow = async (req, res) => {
  try {
    // Check if cow has related records
    const hasMilkRecords = await db.query(
      "SELECT COUNT(*) as count FROM milk_collection WHERE cow_id = ?",
      [req.params.id]
    );

    const hasFeedRecords = await db.query(
      "SELECT COUNT(*) as count FROM feed_monitoring WHERE cow_id = ?",
      [req.params.id]
    );

    const hasVaccineRecords = await db.query(
      "SELECT COUNT(*) as count FROM vaccine_monitoring WHERE cow_id = ?",
      [req.params.id]
    );

    if (
      hasMilkRecords[0].count > 0 ||
      hasFeedRecords[0].count > 0 ||
      hasVaccineRecords[0].count > 0
    ) {
      return res.status(400).json({
        message:
          "Cannot delete cow as it has related records. Consider updating status instead.",
      });
    }

    await db.query("DELETE FROM cows WHERE cow_id = ?", [req.params.id]);
    res.json({ message: "Cow deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get cows by status
exports.getCowsByStatus = async (req, res) => {
  try {
    const cows = await db.query(
      `
      SELECT c.*, cc.category_name, u.username as added_by 
      FROM cows c
      LEFT JOIN cow_categories cc ON c.category_id = cc.category_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.status = ?
    `,
      [req.params.status]
    );

    res.json(cows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
