
function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function validateReportDate(date) {
    const errors = {};

    if (!date) {
        errors.date = "Please select a report date.";
    } else {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(date)) {
            errors.date = "Please enter a valid date.";
        } else {
            const parsedDate = new Date(`${date}T00:00:00Z`);

            if (
                Number.isNaN(parsedDate.getTime()) ||
                parsedDate.toISOString().slice(0, 10) !== date
            ) {
                errors.date = "Please enter a valid date.";
            } else if (date > getTodayDate()) {
                errors.date = "Date cannot be in the future.";
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

module.exports = {
    validateReportDate,
};
