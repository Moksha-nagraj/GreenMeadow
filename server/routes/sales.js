// server/routes/sales.js
const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");

// Cow Sales
router.get("/cows", salesController.getCowSales);
router.post("/cows", salesController.addCowSale);
router.put("/cows/:id", salesController.updateCowSale);
router.delete("/cows/:id", salesController.deleteCowSale);

// Reports
router.get("/reports", salesController.getSalesReport);

module.exports = router;
