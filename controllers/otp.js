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
    "Your OTP for Blog App",
    `<p>Your OTP is: <b>${otp}</b>. It will expire in 5 minutes.</p>`
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
    "Your OTP for Blog App (Resent)",
    `<p>Your new OTP is: <b>${otp}</b>. It will expire in 5 minutes.</p>`
  );

  res.json({ message: "New OTP sent" });
};
