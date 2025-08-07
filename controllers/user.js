const crypto = require("crypto");
const User = require("../models/user");
const Otp = require("../models/otp");
const { createTokenForUser } = require("../services/authentication");
const { sendMail } = require("../services/mailer");
const { validationResult } = require("express-validator");

// ======================= SIGNUP =======================
async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, otp } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  if (!otp) {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: generatedOtp });

    await sendMail(
      email,
      "Verify Your Email – Blog App OTP",
      `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
          <h2 style="color: #4CAF50;">👋 Welcome to Blog App!</h2>
          <p>Thank you for signing up. To verify your email address, please use the OTP below:</p>
          <p style="font-size: 18px; font-weight: bold; color: #000;">Your OTP: <span style="color: #4CAF50;">${generatedOtp}</span></p>
          <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
          <br />
          <p>Happy blogging!<br />— The Blog App Team</p>
        </div>
      `
    );

    return res.status(200).json({ message: "OTP sent to email. Please verify to complete signup." });
  }

  const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!existingOtp || existingOtp.otp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  const user = await User.create({ fullName, email, salt, password: hashedPassword });
  await Otp.deleteMany({ email });

  const token = createTokenForUser(user);

  return res.status(201).json({
    message: "User created successfully",
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email
    }
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
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: generatedOtp });

    await sendMail(
      email,
      "Your Sign-in OTP – Blog App",
      `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
          <h2 style="color: #4CAF50;">🔐 Login Verification</h2>
          <p>To continue signing in, use the OTP below:</p>
          <p style="font-size: 18px; font-weight: bold; color: #000;">Your OTP: <span style="color: #4CAF50;">${generatedOtp}</span></p>
          <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        </div>
      `
    );

    return res.status(200).json({ message: "OTP sent to email. Please verify to complete signin." });
  }

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
        email: user.email
      }
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
