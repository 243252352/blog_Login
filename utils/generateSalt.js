// utils/crypto.js
const crypto = require("crypto");

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = { generateSalt };
