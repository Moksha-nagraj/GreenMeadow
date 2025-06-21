// server/routes/cows.js
const express = require("express");
const router = express.Router();
const cowController = require("../controllers/cowsController");

router.get("/", cowController.getAllCows);
router.get("/:id", cowController.getCowById);
router.get("/status/:status", cowController.getCowsByStatus);
router.post("/", cowController.addCow);
router.put("/:id", cowController.updateCow);
router.delete("/:id", cowController.deleteCow);

module.exports = router;
