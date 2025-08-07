async function verifyEmail(req, res) {
  const { email, otp } = req.body;

  const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!existingOtp || existingOtp.otp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.verified = true;
  await user.save();

  await Otp.deleteMany({ email });

  const token = createTokenForUser(user);

  return res.status(200).json({
    message: "Email verified successfully",
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email
    }
  });
}


modulel.export={verifyEmail};