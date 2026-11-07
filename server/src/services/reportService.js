
const pool = require("../config/database");

// Convert a JavaScript date into YYYY-MM-DD.
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

// Calculate the date range for a report.
function getMonthToDateRange(selectedDate) {
    const [year, month] = selectedDate.split("-").map(Number);

    const startDate = formatDate(
        new Date(Date.UTC(year, month - 1, 1))
    );

    return {
        startDate,
        endDate: selectedDate,
    };
}

// Calculate the previous calendar month's date range.
function getPreviousMonthRange(selectedDate) {
    const [year, month] = selectedDate.split("-").map(Number);

    const startDate = formatDate(
        new Date(Date.UTC(year, month - 2, 1))
    );

    const endDate = formatDate(
        new Date(Date.UTC(year, month - 1, 0))
    );

    return {
        startDate,
        endDate,
    };
}

// Fetch readings and calculate report statistics.
async function generateReport(userId, startDate, endDate) {
    // Calculate statistics.
    const statisticsResult = await pool.query(
        `SELECT
            MAX(glucose_value)::INTEGER AS highest,
            MIN(glucose_value)::INTEGER AS lowest,
            ROUND(AVG(glucose_value), 1) AS average,
            COUNT(*)::INTEGER AS count
         FROM glucose_readings
         WHERE user_id = $1
         AND reading_date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
    );

    // Retrieve readings for the report period.
    const readingsResult = await pool.query(
        `SELECT
            id,
            reading_date,
            time_slot,
            glucose_value,
            created_at,
            updated_at
         FROM glucose_readings
         WHERE user_id = $1
         AND reading_date BETWEEN $2 AND $3
         ORDER BY reading_date ASC,
         CASE time_slot
            WHEN 'MORNING' THEN 1
            WHEN 'AFTER_BREAKFAST' THEN 2
            WHEN 'AFTER_LUNCH' THEN 3
            WHEN 'AFTER_DINNER' THEN 4
         END`,
        [userId, startDate, endDate]
    );

    const stats = statisticsResult.rows[0];

    return {
        period: {
            start_date: startDate,
            end_date: endDate,
        },
        statistics: {
            highest: stats.highest,
            lowest: stats.lowest,
            average:
                stats.average === null
                    ? null
                    : Number(stats.average),
            count: stats.count,
        },
        readings: readingsResult.rows,
    };
}

// Daily report.
async function getDailyReport(userId, selectedDate) {
    return generateReport(
        userId,
        selectedDate,
        selectedDate
    );
}

// Month-to-date report.
async function getMonthToDateReport(userId, selectedDate) {
    const { startDate, endDate } =
        getMonthToDateRange(selectedDate);

    return generateReport(
        userId,
        startDate,
        endDate
    );
}

// Previous monthly report.
async function getMonthlyReport(userId, selectedDate) {
    const { startDate, endDate } =
        getPreviousMonthRange(selectedDate);

    return generateReport(
        userId,
        startDate,
        endDate
    );
}

module.exports = {
    getDailyReport,
    getMonthToDateReport,
    getMonthlyReport,
};
