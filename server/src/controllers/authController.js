
const { registerUser, loginUser, getUserById } = require("../services/authService");
const generateToken = require("../utils/generateToken");

async function register(req, res) {
    try {
        const { name, email, password } = req.body || {};

        // Validate required fields.
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required.",
            });
        }

        // Validate name.
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty.",
            });
        }

        // Validate email format.
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            typeof email !== "string" ||
            !emailPattern.test(email.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        // Validate password.
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long.",
            });
        }

        const user = await registerUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
        });

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

async function login(req, res) {
    try {
        const { email, password } = req.body || {};

        // Validate required fields.
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // Validate email format.
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            typeof email !== "string" ||
            !emailPattern.test(email.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        // Validate password.
        if (typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid password.",
            });
        }

        const user = await loginUser({
            email: email.trim().toLowerCase(),
            password,
        });

        const token = generateToken(user.id);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Something went wrong during login.",
        });
    }
}


async function getMe(req, res) {
    try {
        // User ID comes from the verified JWT middleware.
        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details retrieved successfully.",
            data: {
                user,
            },
        });
    } catch (error) {
        console.error("Get user error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while retrieving user details.",
        });
    }
}


module.exports = {
    register,
    login,
    getMe,
};
