const crypto = require("crypto");
const Otp = require("../models/otp");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const { sendMail } = require("../services/mailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOTP();
  await Otp.deleteMany({ email }); // remove previous OTPs

  await Otp.create({ email, otp });

  await sendMail(
    email,
    "Verify Your Email – Blog App OTP",
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #4CAF50;">👋 Welcome to Blog App!</h2>
        <p>Thank you for signing up. To verify your email address, please use the OTP below:</p>
        <p style="font-size: 18px; font-weight: bold; color: #000;">Your OTP: <span style="color: #4CAF50;">${otp}</span></p>
        <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br />
        <p>Happy blogging!<br />— The Blog App Team</p>
      </div>
    `
  );

  res.json({ message: "OTP sent to email" });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email, otp });

  if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      fullName: "User",
      password: crypto.randomBytes(10).toString("hex") // random password
    });
  }

  const token = createTokenForUser(user);
  await Otp.deleteMany({ email });

  res.json({ token, user: { email: user.email, fullName: user.fullName, _id: user._id } });
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOTP();
  await Otp.deleteMany({ email });

  await Otp.create({ email, otp });

  await sendMail(
    email,
    "Verify Your Email – Blog App OTP",
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #4CAF50;">👋 Welcome to Blog App!</h2>
        <p>Thank you for signing up. To verify your email address, please use the OTP below:</p>
        <p style="font-size: 18px; font-weight: bold; color: #000;">Your OTP: <span style="color: #4CAF50;">${otp}</span></p>
        <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br />
        <p>Happy blogging!<br />— The Blog App Team</p>
      </div>
    `
  );

  res.json({ message: "New OTP sent" });
};
