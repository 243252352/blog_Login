const jwt = require("jsonwebtoken");

function createTokenForUser(user) {
    const payload = {
        _id: user._id
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
}

function validateToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { createTokenForUser, validateToken };
