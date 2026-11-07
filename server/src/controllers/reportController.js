
const {
    getDailyReport,
    getMonthToDateReport,
    getMonthlyReport,
} = require("../services/reportService");

const {
    validateReportDate,
} = require("../validators/reportValidator");

// Daily report
async function dailyReport(req, res) {
    try {
        const { date } = req.query;

        const validation = validateReportDate(date);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.errors,
            });
        }

        const report = await getDailyReport(
            req.user.id,
            date
        );

        return res.status(200).json({
            success: true,
            message: "Daily report generated successfully.",
            data: report,
        });
    } catch (error) {
        console.error("Daily report error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to generate daily report.",
        });
    }
}

// Month-to-date report
async function monthToDateReport(req, res) {
    try {
        const { date } = req.query;

        const validation = validateReportDate(date);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.errors,
            });
        }

        const report = await getMonthToDateReport(
            req.user.id,
            date
        );

        return res.status(200).json({
            success: true,
            message: "Month-to-date report generated successfully.",
            data: report,
        });
    } catch (error) {
        console.error("Month-to-date report error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to generate month-to-date report.",
        });
    }
}

// Previous monthly report
async function monthlyReport(req, res) {
    try {
        const { date } = req.query;

        const validation = validateReportDate(date);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.errors,
            });
        }

        const report = await getMonthlyReport(
            req.user.id,
            date
        );

        return res.status(200).json({
            success: true,
            message: "Monthly report generated successfully.",
            data: report,
        });
    } catch (error) {
        console.error("Monthly report error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to generate monthly report.",
        });
    }
}

module.exports = {
    dailyReport,
    monthToDateReport,
    monthlyReport,
};
