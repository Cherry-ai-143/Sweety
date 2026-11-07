import apiRequest from "./api";

// Get daily glucose report
export async function getDailyReport(date, token) {
    return apiRequest(
        `/reports/daily?date=${encodeURIComponent(date)}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
}

// Get month-to-date glucose report
export async function getMonthToDateReport(date, token) {
    return apiRequest(
        `/reports/month-to-date?date=${encodeURIComponent(date)}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
}

// Get previous month's glucose report
export async function getMonthlyReport(date, token) {
    return apiRequest(
        `/reports/monthly?date=${encodeURIComponent(date)}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
}