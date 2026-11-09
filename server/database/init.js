/**
 * Database Initialization Script for Sweety – Blood Glucose Tracker
 * 
 * Reads and applies server/database/schema.sql to set up:
 *  - pgcrypto extension for UUIDs
 *  - users table
 *  - glucose_readings table with constraints
 *  - database indexes
 * 
 * Safe and idempotent: can be executed multiple times without deleting data.
 */

const fs = require("fs");
const path = require("path");

// Load environment configuration from server/.env
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = require("../src/config/database");

async function initializeDatabase() {
    console.log("==================================================");
    console.log("🚀 Sweety Database Initializer Starting...");
    console.log("==================================================");

    const schemaPath = path.resolve(__dirname, "schema.sql");

    if (!fs.existsSync(schemaPath)) {
        console.error(`❌ Schema file not found at: ${schemaPath}`);
        process.exitCode = 1;
        return;
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    const client = await pool.connect();

    try {
        const dbName = process.env.DB_NAME || "Sweety_db";
        const dbHost = process.env.DB_HOST || "localhost";
        const dbPort = process.env.DB_PORT || 5432;

        console.log(`Connecting to database: ${dbName} on ${dbHost}:${dbPort}`);
        console.log("Executing schema DDL statements...");

        await client.query("BEGIN");
        await client.query(schemaSql);
        await client.query("COMMIT");

        // Verify tables exist
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'glucose_readings')
            ORDER BY table_name
        `);

        const initializedTables = tablesRes.rows.map((r) => r.table_name);

        console.log("\n==================================================");
        console.log("✅ Database Schema Initialized Successfully!");
        console.log("==================================================");
        console.log("Active Tables:");
        initializedTables.forEach((t) => console.log(`  • ${t}`));
        console.log("\nNext step: Run 'npm run seed' to insert demo data.");
        console.log("==================================================\n");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("\n❌ Database initialization failed!");
        console.error("Error details:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
        console.log("PostgreSQL connection pool closed.");
    }
}

// Execute script
initializeDatabase();

