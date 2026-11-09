import apiRequest from "./api";

// Register a new user
export async function registerUser(userData) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });
}

// Login an existing user
export async function loginUser(credentials) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}

// Get the logged-in user's profile
export async function getCurrentUser(token) {
    return apiRequest("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

// Permanently delete the user's account and all data
export async function deleteAccount(token) {
    return apiRequest("/auth/me", {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
