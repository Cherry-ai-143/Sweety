
const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check API
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database"
        );

        res.status(200).json({
            success: true,
            message: "Sweety API is running successfully!",
            database: result.rows[0].database,
        });
    } catch (error) {
        console.error("Health check failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

module.exports = app;
