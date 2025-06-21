// server/routes/feed.js
const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");

router.get("/", feedController.getFeedRecords);
router.get("/cow/:cowId", feedController.getFeedRecords);
router.post("/", feedController.addFeedRecord);
router.put("/:id", feedController.updateFeedRecord);
router.delete("/:id", feedController.deleteFeedRecord);

// Reports
router.get("/reports/consumption", feedController.getFeedConsumptionReport);

module.exports = router;
