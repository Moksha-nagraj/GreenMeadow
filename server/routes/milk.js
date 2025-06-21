// server/routes/milk.js
const express = require("express");
const router = express.Router();
const milkController = require("../controllers/milkController");

// Milk Collection
router.get("/collection", milkController.getMilkCollections);
router.get("/collection/cow/:cowId", milkController.getMilkCollections);
router.post("/collection", milkController.addMilkCollection);
router.put("/collection/:id", milkController.updateMilkCollection);
router.delete("/collection/:id", milkController.deleteMilkCollection);

// Milk Sales
router.get("/sales", milkController.getMilkSales);
router.post("/sales", milkController.addMilkSale);
router.put("/sales/:id", milkController.updateMilkSale);
router.delete("/sales/:id", milkController.deleteMilkSale);

// Reports
router.get("/reports/production", milkController.getMilkProductionReport);

module.exports = router;
