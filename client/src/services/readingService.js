
import apiRequest from "./api";

// Create a glucose reading
export async function createReading(readingData, token) {
    return apiRequest("/readings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(readingData),
    });
}

// Get all glucose readings
export async function getReadings(token) {
    return apiRequest("/readings", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

// Get a single glucose reading by ID
export async function getReadingById(id, token) {
    return apiRequest(`/readings/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

// Update an existing glucose reading
export async function updateReading(id, readingData, token) {
    return apiRequest(`/readings/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(readingData),
    });
}

// Delete a glucose reading
export async function deleteReading(id, token) {
    return apiRequest(`/readings/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
