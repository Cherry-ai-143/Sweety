
const ALLOWED_TIME_SLOTS = [
    "MORNING",
    "AFTER_BREAKFAST",
    "AFTER_LUNCH",
    "AFTER_DINNER",
];

// Get today's date in the server's local timezone (YYYY-MM-DD).
function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function validateReading({ reading_date, time_slot, glucose_value }) {
    const errors = {};

    // Validate date.
    if (!reading_date) {
        errors.reading_date = "Please select a date.";
    } else {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(reading_date)) {
            errors.reading_date = "Please enter a valid date.";
        } else {
            const parsedDate = new Date(`${reading_date}T00:00:00Z`);

            if (
                Number.isNaN(parsedDate.getTime()) ||
                parsedDate.toISOString().slice(0, 10) !== reading_date
            ) {
                errors.reading_date = "Please enter a valid date.";
            } else {
                // Compare against the server's local date, not UTC.
                const today = getTodayDate();

                if (reading_date > today) {
                    errors.reading_date =
                        "Date cannot be in the future.";
                }
            }
        }
    }

    // Validate time slot.
    if (!ALLOWED_TIME_SLOTS.includes(time_slot)) {
        errors.time_slot = "Please select a valid time slot.";
    }

    // Validate glucose value.
    if (
        glucose_value === undefined ||
        glucose_value === null ||
        glucose_value === ""
    ) {
        errors.glucose_value =
            "Please enter a glucose value.";
    } else if (
        !Number.isInteger(Number(glucose_value)) ||
        Number(glucose_value) < 40 ||
        Number(glucose_value) > 600
    ) {
        errors.glucose_value =
            "Value must be between 40 and 600 mg/dl.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

module.exports = {
    ALLOWED_TIME_SLOTS,
    validateReading,
};
