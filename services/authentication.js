const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";

function createTokenForUser(user) {
  return jwt.sign(
    {
      _id: user._id,
    //   email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function validateToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT Error:", error.message);
    throw error;
  }
}

module.exports = { createTokenForUser, validateToken };
