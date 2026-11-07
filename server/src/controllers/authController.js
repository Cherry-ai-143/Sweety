
const { registerUser } = require("../services/authService");
const generateToken = require("../utils/generateToken");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate required fields.
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required.",
            });
        }

        // Validate name.
        if (!name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty.",
            });
        }

        // Validate email format.
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        // Validate password length.
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long.",
            });
        }

        const user = await registerUser({ name, email, password });

        const token = generateToken(user.id);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Something went wrong during registration.",
        });
    }
}

module.exports = {
    register,
};
