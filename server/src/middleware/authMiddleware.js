
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        // Read the Authorization header.
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
        }

        // Extract the token.
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        // Verify the token.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach authenticated user information to the request.
        req.user = {
            id: decoded.id,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token.",
        });
    }
}

module.exports = authMiddleware;
