const crypto = require("crypto");
const { User, hashPassword } = require("../models/user");
const Otp = require("../models/otp");
const { validationResult } = require("express-validator");
const { sendOtp } = require("./otp");
const { throwIfEmailExists } = require("../utils/dbChecks");
const generateSalt=require("../utils/generateSalt");
const { generate } = require("otp-generator");

// ======================= SIGNUP =======================
async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password } = req.body;

  if (await throwIfEmailExists(User, email, res)) return;

  const salt = generateSalt();
  const hashedPassword = hashPassword(password, salt);

  await User.create({
    fullName,
    email,
    salt,
    password: hashedPassword,
    verified: false,
  });

  req.body.onlyOtp = true;
  return sendOtp(req, res);
}

// ======================= SIGNIN =======================
async function signin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!otp) {
    req.body.onlyOtp = true;
    return sendOtp(req, res);
  }

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    await Otp.deleteMany({ email });

    return res.status(200).json({
      message: "Signin successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

// ======================= LOGOUT =======================
async function logout(req, res) {
  return res.status(200).json({ message: "Logout successful" });
}

// ======================= UPDATE USER =======================
async function updateUser(req, res) {
  const userId = req.params.id;
  const { fullName } = req.body;

  if (req.user._id.toString() !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!fullName || fullName === user.fullName) {
    return res.status(400).json({ error: "No changes detected" });
  }

  user.fullName = fullName;
  await user.save();

  return res.status(200).json({ message: "User updated successfully", user });
}

// ======================= DELETE USER =======================
async function deleteUser(req, res) {
  const userId = req.params.id;

  if (req.user._id.toString() !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({ message: "User deleted successfully" });
}

module.exports = {
  signup,
  signin,
  logout,
  updateUser,
  deleteUser,
};
