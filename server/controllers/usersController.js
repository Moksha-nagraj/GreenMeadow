// server/controllers/usersController.js
const db = require("../models/db");
const bcrypt = require("bcryptjs");

// Register a new user (admin only)
exports.register = async (req, res) => {
  const {
    username,
    password,
    full_name,
    email,
    contact,
    role = "staff",
    status = "active",
  } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    // Check if user exists
    const [userExists] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (userExists.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      "INSERT INTO users (username, password_hash, full_name, email, contact, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [username, password_hash, full_name, email, contact, role, status]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: result.insertId,
        username,
        full_name,
        email,
        contact,
        role,
        status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  try {
    // Check if user exists
    const [user] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (user[0].status !== "active") {
      return res.status(400).json({ message: "Account is inactive" });
    }

    res.json({
      message: "Logged in successfully",
      user: {
        user_id: user[0].user_id,
        username: user[0].username,
        full_name: user[0].full_name,
        email: user[0].email,
        contact: user[0].contact,
        role: user[0].role,
        status: user[0].status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT user_id, username, full_name, email, contact, role, status, created_at 
      FROM users
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await db.query(
      `
      SELECT user_id, username, full_name, email, contact, role, status, created_at 
      FROM users WHERE user_id = ?
    `,
      [req.params.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { full_name, email, contact, role, status } = req.body;

  try {
    await db.query(
      `UPDATE users 
       SET full_name = ?, email = ?, contact = ?, role = ?, status = ?
       WHERE user_id = ?`,
      [full_name, email, contact, role, status, req.params.id]
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user (soft delete by setting status to inactive)
exports.deleteUser = async (req, res) => {
  try {
    await db.query("UPDATE users SET status = 'inactive' WHERE user_id = ?", [
      req.params.id,
    ]);
    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await db.query(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [req.body.user_id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user[0].password_hash
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      newPasswordHash,
      req.body.user_id,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
