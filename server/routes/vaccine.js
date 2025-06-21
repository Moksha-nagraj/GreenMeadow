// server/routes/vaccine.js
const express = require("express");
const router = express.Router();
const vaccineController = require("../controllers/vaccineController");

router.get("/", vaccineController.getVaccineRecords);
router.get("/cow/:cowId", vaccineController.getVaccineRecords);
router.post("/", vaccineController.addVaccineRecord);
router.put("/:id", vaccineController.updateVaccineRecord);
router.delete("/:id", vaccineController.deleteVaccineRecord);

// Reports
router.get("/reports", vaccineController.getVaccineReport);

module.exports = router;
