
const pool = require("../config/database");
const bcrypt = require("bcryptjs");

async function registerUser({ name, email, password }) {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

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

async function loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        `SELECT id, name, email, password_hash
     FROM users
     WHERE email = $1`,
        [normalizedEmail]
    );

    const user = result.rows[0];

    // Check whether the account exists.
    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    // Compare the entered password with the stored hash.
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    // Never return the password hash.
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}

module.exports = {
    registerUser,
    loginUser,
};
