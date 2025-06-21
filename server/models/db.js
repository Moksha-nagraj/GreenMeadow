// server/models/db.js
const mysql = require("mysql2/promise"); // ← Use promise version
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
pool
  .getConnection()
  .then((conn) => {
    console.log("MySQL connected!");
    conn.release();
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

module.exports = pool;
