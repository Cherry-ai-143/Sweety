
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    dailyReport,
    monthToDateReport,
    monthlyReport,
} = require("../controllers/reportController");

const router = express.Router();

// Protect all report endpoints.
router.use(authMiddleware);

// Daily report
router.get("/daily", dailyReport);

// Month-to-date report
router.get("/month-to-date", monthToDateReport);

// Previous calendar month report
router.get("/monthly", monthlyReport);

module.exports = router;
