const otpGenerator = require("otp-generator");
const Otp = require("../models/otp");
const { sendMail } = require("../services/mailer");
const {
  getEmailVerificationTemplate,
} = require("../templates/emailVerificationTemplate");

function generateOTP() {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
}

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOTP();
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp });

  const htmlContent = getEmailVerificationTemplate(email, otp);
  await sendMail(email, "Verify Your Email – Blog App OTP", htmlContent);

  return res.status(200).json({
    message: req.body.onlyOtp
      ? "OTP sent to email"
      : "Signup successful. Please verify your email using the OTP sent.",
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });

  if (!record) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.verified = true;
  await user.save();
  await Otp.deleteMany({ email });

  return res.status(200).json({ message: "Email verified successfully" });
};
