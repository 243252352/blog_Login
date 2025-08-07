const crypto = require("crypto");
const { User, hashPassword } = require("../models/user");
const Otp = require("../models/otp");
const { createTokenForUser } = require("../services/authentication");
const { sendMail } = require("../services/mailer");
const { validationResult } = require("express-validator");
const { sendOtp, verifyOtp } = require("./otp");
const { constrainedMemory } = require("process");

// ======================= SIGNUP =======================
async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = hashPassword(password, salt);

  const user = await User.create({
    fullName,
    email,
    salt,
    password: hashedPassword,
    verified: false,
  });

  await sendOtp(req, res); // Send OTP after saving

  return res.status(201).json({
    message: "Signup successful. Please verify your email using the OTP sent.",
  });
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
    return await sendOtp(req, res);
  }
  //to remove with verify
  const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!existingOtp || existingOtp.otp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
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
