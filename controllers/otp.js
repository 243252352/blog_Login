const crypto = require("crypto");
const Otp = require("../models/otp");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const { sendMail } = require("../services/mailer");
const otpGenerator = require('otp-generator')
const {getEmailVerificationTemplate} = require('../templates/emailVerificationTemplate');


function generateOTP() {
  return otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
}

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOTP();
  await Otp.deleteMany({ email }); 

  await Otp.create({ email, otp });

 const htmlContent = getEmailVerificationTemplate(email,otp);
await sendMail(email, "Verify Your Email – Blog App OTP", htmlContent);

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
      password: crypto.randomBytes(10).toString("hex") 
    });
  }

  const token = createTokenForUser(user);
  await Otp.deleteMany({ email });

  res.json({ token, user: { email: user.email, fullName: user.fullName, _id: user._id } });
};

