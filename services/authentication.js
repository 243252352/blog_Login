const JWT = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;  // hardcoded mat rakho


function createTokenForUser(user) {
    const payload = {
      _id: user._id.toString() ,
    };
    return JWT.sign(payload, secret, { expiresIn: "7d" });
}

function validateToken(token) {
    return JWT.verify(token, secret);
}

module.exports = {
    createTokenForUser,
    validateToken,
};
