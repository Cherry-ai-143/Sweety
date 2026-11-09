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

// Get monthly glucose report (supports mode 'selected' for month-wise or 'previous')
export async function getMonthlyReport(date, token, mode = "selected") {
    const url = mode
        ? `/reports/monthly?date=${encodeURIComponent(date)}&mode=${encodeURIComponent(mode)}`
        : `/reports/monthly?date=${encodeURIComponent(date)}`;
    return apiRequest(
        url,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
}