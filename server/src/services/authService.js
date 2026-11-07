
const pool = require("../config/database");
const bcrypt = require("bcryptjs");

async function registerUser({ name, email, password }) {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Hash the password before saving it.
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
            [normalizedName, normalizedEmail, passwordHash]
        );

        return result.rows[0];
    } catch (error) {
        // PostgreSQL error code 23505 means unique constraint violation.
        if (error.code === "23505") {
            const duplicateError = new Error(
                "An account with this email already exists."
            );

            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw error;
    }
}

module.exports = {
    registerUser,
};
