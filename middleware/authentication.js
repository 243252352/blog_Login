const jwt = require("jsonwebtoken");
const User = require("../models/user");

function checkForAuthenticationCookie(tokenName) {
    return async (req, res, next) => {
        const token = req.cookies[tokenName];
        if (!token) {
            return res.status(401).json({ error: "Authentication token missing" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded._id).select("-password -salt");

            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }

            req.user = user;
            next();

        } catch (err) {
            console.error("Auth error:", err.message);
            return res.status(401).json({ error: "Invalid or expired token" });
        }
    };
}

module.exports = { checkForAuthenticationCookie };
