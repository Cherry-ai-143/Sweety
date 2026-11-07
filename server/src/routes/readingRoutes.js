
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    addReading,
    getReadings,
    getReading,
    editReading,
    removeReading,
} = require("../controllers/readingController");

const router = express.Router();

// All reading routes require authentication.
router.use(authMiddleware);

// Create a reading
router.post("/", addReading);

// Get all readings
router.get("/", getReadings);

// Get a specific reading
router.get("/:id", getReading);

// Update a reading
router.put("/:id", editReading);

// Delete a reading
router.delete("/:id", removeReading);

module.exports = router;
