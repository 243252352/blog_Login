const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  handle: { type: String, unique: true },
  salt: String,
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
