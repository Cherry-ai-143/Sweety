/**
 * PostgreSQL Database Seed Script for Sweety - Blood Glucose Tracker
 * 
 * Inserts:
 *  1. Demo User: Sweety Demo User (demo@sweety.com / Demo@12345)
 *  2. Sample Blood Glucose Readings across recent dates (current & previous months)
 *     covering all 4 time slots: MORNING, AFTER_BREAKFAST, AFTER_LUNCH, AFTER_DINNER.
 * 
 * Idempotent: Can be run multiple times safely without creating duplicates.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const bcrypt = require("bcryptjs");
const pool = require("../src/config/database");

// Demo user credentials
const DEMO_USER = {
    name: "Sweety Demo User",
    email: "demo@sweety.com",
    password: "Demo@12345",
};

// Supported time slots
const TIME_SLOTS = {
    MORNING: "MORNING",
    AFTER_BREAKFAST: "AFTER_BREAKFAST",
    AFTER_LUNCH: "AFTER_LUNCH",
    AFTER_DINNER: "AFTER_DINNER",
};

/**
 * Format a year, month (1-12), and day (1-31) into YYYY-MM-DD
 */
function formatYMD(year, month, day) {
    const y = String(year);
    const m = String(month).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Generate a realistic, deduplicated list of sample glucose readings
 * spanning current month and previous calendar month relative to runtime date.
 */
function generateSampleReadings() {
    const readings = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();

    // Set of added dates to prevent any day collisions
    const addedDates = new Set();

    function addDayReadings(dateStr, morningVal, breakfastVal, lunchVal, dinnerVal) {
        if (addedDates.has(dateStr)) return;
        addedDates.add(dateStr);

        readings.push(
            { reading_date: dateStr, time_slot: TIME_SLOTS.MORNING, glucose_value: morningVal },
            { reading_date: dateStr, time_slot: TIME_SLOTS.AFTER_BREAKFAST, glucose_value: breakfastVal },
            { reading_date: dateStr, time_slot: TIME_SLOTS.AFTER_LUNCH, glucose_value: lunchVal },
            { reading_date: dateStr, time_slot: TIME_SLOTS.AFTER_DINNER, glucose_value: dinnerVal }
        );
    }

    // 1. Current Month Readings (from today going backward, never in future)
    const currentMonthProfiles = [
        { offset: 0, m: 94, b: 128, l: 135, d: 122 },  // Today
        { offset: 1, m: 88, b: 118, l: 142, d: 130 },  // Yesterday
        { offset: 2, m: 98, b: 134, l: 126, d: 145 },  // 2 days ago
        { offset: 3, m: 104, b: 148, l: 132, d: 138 }, // 3 days ago
        { offset: 4, m: 91, b: 122, l: 138, d: 126 },  // 4 days ago
        { offset: 6, m: 86, b: 116, l: 128, d: 120 },  // 6 days ago
        { offset: 8, m: 95, b: 130, l: 145, d: 134 },  // 8 days ago
    ];

    for (const p of currentMonthProfiles) {
        const targetDay = currentDay - p.offset;
        if (targetDay >= 1) {
            const dateStr = formatYMD(currentYear, currentMonth, targetDay);
            addDayReadings(dateStr, p.m, p.b, p.l, p.d);
        }
    }

    // Ensure 1st of current month is present for month-to-date starting point
    if (currentDay > 1) {
        const firstCurrentMonth = formatYMD(currentYear, currentMonth, 1);
        addDayReadings(firstCurrentMonth, 92, 124, 130, 128);
    }

    // 2. Previous Calendar Month Readings (for testing previous month reports)
    // Find last day of previous month
    const prevMonthEnd = new Date(currentYear, currentMonth - 1, 0);
    const prevYear = prevMonthEnd.getFullYear();
    const prevMonth = prevMonthEnd.getMonth() + 1;
    const prevLastDay = prevMonthEnd.getDate();

    const prevMonthDays = [
        { day: prevLastDay, m: 96, b: 130, l: 140, d: 128 },
        { day: Math.min(24, prevLastDay), m: 85, b: 120, l: 134, d: 124 },
        { day: Math.min(18, prevLastDay), m: 102, b: 144, l: 152, d: 136 },
        { day: Math.min(12, prevLastDay), m: 91, b: 126, l: 138, d: 122 },
        { day: Math.min(6, prevLastDay), m: 89, b: 118, l: 125, d: 130 },
        { day: 1, m: 95, b: 132, l: 130, d: 126 },
    ];

    for (const p of prevMonthDays) {
        const dateStr = formatYMD(prevYear, prevMonth, p.day);
        addDayReadings(dateStr, p.m, p.b, p.l, p.d);
    }

    return readings;
}

/**
 * Main Database Seeder Function
 */
async function seedDatabase() {
    console.log("==================================================");
    console.log("🌱 Sweety Database Seeder Starting...");
    console.log("==================================================");

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // --------------------------------------------------
        // Step 1: Demo User (Idempotent insertion)
        // --------------------------------------------------
        console.log(`\nChecking demo user: ${DEMO_USER.email}`);
        
        let userId;
        const existingUserRes = await client.query(
            "SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)",
            [DEMO_USER.email]
        );

        if (existingUserRes.rows.length > 0) {
            userId = existingUserRes.rows[0].id;
            console.log(`ℹ️  Demo user already exists in database.`);
            console.log(`   User ID : ${userId}`);
            console.log(`   Name    : ${existingUserRes.rows[0].name}`);
            console.log(`   Email   : ${existingUserRes.rows[0].email}`);
        } else {
            // Hash password with bcryptjs (12 rounds matching authService)
            console.log("Hashing password with bcryptjs (12 salt rounds)...");
            const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

            const newUserRes = await client.query(
                `INSERT INTO users (name, email, password_hash)
                 VALUES ($1, $2, $3)
                 RETURNING id, name, email, created_at`,
                [DEMO_USER.name, DEMO_USER.email.toLowerCase(), passwordHash]
            );

            userId = newUserRes.rows[0].id;
            console.log(`✅ Demo user created successfully.`);
            console.log(`   User ID : ${userId}`);
            console.log(`   Name    : ${newUserRes.rows[0].name}`);
            console.log(`   Email   : ${newUserRes.rows[0].email}`);
        }

        // --------------------------------------------------
        // Step 2: Sample Blood Glucose Readings
        // --------------------------------------------------
        const sampleReadings = generateSampleReadings();
        console.log(`\nSeeding ${sampleReadings.length} sample readings for user ${userId}...`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const reading of sampleReadings) {
            // Use ON CONFLICT on (user_id, reading_date, time_slot) to guarantee idempotency
            const insertRes = await client.query(
                `INSERT INTO glucose_readings (user_id, reading_date, time_slot, glucose_value)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, reading_date, time_slot) DO NOTHING
                 RETURNING id`,
                [userId, reading.reading_date, reading.time_slot, reading.glucose_value]
            );

            if (insertRes.rows.length > 0) {
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        await client.query("COMMIT");

        // --------------------------------------------------
        // Step 3: Verification & Summary
        // --------------------------------------------------
        const totalReadingsRes = await pool.query(
            "SELECT COUNT(*)::INTEGER AS total FROM glucose_readings WHERE user_id = $1",
            [userId]
        );

        console.log("\n==================================================");
        console.log("🎉 Seeding Completed Successfully!");
        console.log("==================================================");
        console.log(`📊 New readings inserted : ${createdCount}`);
        console.log(`ℹ️  Existing readings kept : ${skippedCount}`);
        console.log(`📈 Total user readings    : ${totalReadingsRes.rows[0].total}`);
        console.log("\n🔑 Demo Account Credentials:");
        console.log(`   Email    : ${DEMO_USER.email}`);
        console.log(`   Password : ${DEMO_USER.password}`);
        console.log("==================================================\n");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("\n❌ Database seeding failed! Transaction rolled back.");
        console.error("Error details:", error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
        console.log("PostgreSQL connection pool closed.");
    }
}

// Execute seed script
seedDatabase();

