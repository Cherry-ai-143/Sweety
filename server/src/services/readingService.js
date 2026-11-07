
const pool = require("../config/database");

const SLOT_LABELS = {
    MORNING: "Morning",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Create a glucose reading
async function createReading(userId, readingData) {
    const { reading_date, time_slot, glucose_value } = readingData;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))`,
            [userId, reading_date]
        );

        const existing = await client.query(
            `SELECT id FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3`,
            [userId, reading_date, time_slot]
        );

        if (existing.rows.length > 0) {
            throw createServiceError(
                `You already have a ${SLOT_LABELS[time_slot]} reading for this date.`,
                409
            );
        }

        const count = await client.query(
            `SELECT COUNT(*)::INTEGER AS total
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2`,
            [userId, reading_date]
        );

        if (count.rows[0].total >= 4) {
            throw createServiceError(
                "You can add only 4 readings per day.",
                409
            );
        }

        const result = await client.query(
            `INSERT INTO glucose_readings
       (user_id, reading_date, time_slot, glucose_value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [userId, reading_date, time_slot, Number(glucose_value)]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Get all readings belonging to the logged-in user
async function getAllReadings(userId) {
    const result = await pool.query(
        `SELECT id, reading_date, time_slot, glucose_value,
            created_at, updated_at
     FROM glucose_readings
     WHERE user_id = $1
     ORDER BY reading_date DESC,
     CASE time_slot
       WHEN 'MORNING' THEN 1
       WHEN 'AFTER_BREAKFAST' THEN 2
       WHEN 'AFTER_LUNCH' THEN 3
       WHEN 'AFTER_DINNER' THEN 4
     END`,
        [userId]
    );

    return result.rows;
}

// Get one reading by ID
async function getReadingById(userId, readingId) {
    const result = await pool.query(
        `SELECT id, reading_date, time_slot, glucose_value,
            created_at, updated_at
     FROM glucose_readings
     WHERE id = $1 AND user_id = $2`,
        [readingId, userId]
    );

    return result.rows[0] || null;
}

// Update a reading
async function updateReading(userId, readingId, readingData) {
    const { reading_date, time_slot, glucose_value } = readingData;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Serialize modifications for this user.
        await client.query(
            `SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))`,
            [userId, "readings-update"]
        );

        const currentResult = await client.query(
            `SELECT id FROM glucose_readings
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
            [readingId, userId]
        );

        if (currentResult.rows.length === 0) {
            throw createServiceError("Glucose reading not found.", 404);
        }

        const duplicate = await client.query(
            `SELECT id FROM glucose_readings
       WHERE user_id = $1
       AND reading_date = $2
       AND time_slot = $3
       AND id != $4`,
            [userId, reading_date, time_slot, readingId]
        );

        if (duplicate.rows.length > 0) {
            throw createServiceError(
                `You already have a ${SLOT_LABELS[time_slot]} reading for this date.`,
                409
            );
        }

        const count = await client.query(
            `SELECT COUNT(*)::INTEGER AS total
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2
       AND id != $3`,
            [userId, reading_date, readingId]
        );

        if (count.rows[0].total >= 4) {
            throw createServiceError(
                "You can add only 4 readings per day.",
                409
            );
        }

        const result = await client.query(
            `UPDATE glucose_readings
       SET reading_date = $1,
           time_slot = $2,
           glucose_value = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
            [
                reading_date,
                time_slot,
                Number(glucose_value),
                readingId,
                userId,
            ]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Delete a reading
async function deleteReading(userId, readingId) {
    const result = await pool.query(
        `DELETE FROM glucose_readings
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
        [readingId, userId]
    );

    return result.rows[0] || null;
}

module.exports = {
    createReading,
    getAllReadings,
    getReadingById,
    updateReading,
    deleteReading,
};
