// app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import Routes
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const cowRoutes = require("./routes/cows");
const milkRoutes = require("./routes/milk");
const feedRoutes = require("./routes/feeding");
const vaccineRoutes = require("./routes/vaccine");
const saleRoutes = require("./routes/sales");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cows", cowRoutes);
app.use("/api/milk", milkRoutes);
app.use("/api/feeding", feedRoutes);
app.use("/api/vaccine", vaccineRoutes);
app.use("/api/sales", saleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
