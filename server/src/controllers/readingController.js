
const {
    createReading,
    getAllReadings,
    getReadingById,
    updateReading,
    deleteReading,
} = require("../services/readingService");

const {
    validateReading,
} = require("../validators/readingValidator");

// Create a reading
async function addReading(req, res) {
    try {
        const validation = validateReading(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.errors,
            });
        }

        const reading = await createReading(req.user.id, req.body);

        return res.status(201).json({
            success: true,
            message: "Glucose reading added successfully.",
            data: reading,
        });
    } catch (error) {
        console.error("Add reading error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to add glucose reading.",
        });
    }
}

// Get all readings
async function getReadings(req, res) {
    try {
        const readings = await getAllReadings(req.user.id);

        return res.status(200).json({
            success: true,
            count: readings.length,
            data: readings,
        });
    } catch (error) {
        console.error("Get readings error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve glucose readings.",
        });
    }
}

// Get one reading
async function getReading(req, res) {
    try {
        const reading = await getReadingById(
            req.user.id,
            req.params.id
        );

        if (!reading) {
            return res.status(404).json({
                success: false,
                message: "Glucose reading not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: reading,
        });
    } catch (error) {
        console.error("Get reading error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve glucose reading.",
        });
    }
}

// Update a reading
async function editReading(req, res) {
    try {
        const validation = validateReading(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validation.errors,
            });
        }

        const reading = await updateReading(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Glucose reading updated successfully.",
            data: reading,
        });
    } catch (error) {
        console.error("Update reading error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to update glucose reading.",
        });
    }
}

// Delete a reading
async function removeReading(req, res) {
    try {
        const deleted = await deleteReading(
            req.user.id,
            req.params.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Glucose reading not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Glucose reading deleted successfully.",
        });
    } catch (error) {
        console.error("Delete reading error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete glucose reading.",
        });
    }
}

module.exports = {
    addReading,
    getReadings,
    getReading,
    editReading,
    removeReading,
};
