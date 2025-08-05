const crypto = require("crypto");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const { sendMail } = require("../services/mailer");
const Otp = require("../models/otp");

async function signup(req, res) {
  try {
    const { fullName, email, password, otp } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (!otp) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      await Otp.deleteMany({ email }); // clean up previous OTPs
      await Otp.create({ email, otp: generatedOtp });

      await sendMail(
        email,
        "OTP for Blog App Signup",
        `<p>Your OTP is: <b>${generatedOtp}</b>. It expires in 5 minutes.</p>`
      );


      return res.status(200).json({ message: "OTP sent to your email" });
    }

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ error: "Invalid OTP" });

    await Otp.deleteMany({ email }); // OTP cleanup

    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");

    const newUser = new User({ fullName, email, password: hashedPassword, salt });
    await newUser.save();

    const token = createTokenForUser(newUser);

    await sendMail(
      email,
      "Welcome to the Blog App 🎉",
      `<h2>Hi ${fullName},</h2><p>Welcome to our Blog App! We're excited to have you on board.</p>`
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const signin = async (req, res) => {
  const { email, password, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const hashedInputPassword = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
    .toString("hex");

  if (user.password !== hashedInputPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!otp) {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: generatedOtp });

    await sendMail(
      email,
      "OTP for Blog App Signin",
      `<p>Your OTP is: <b>${generatedOtp}</b>. It expires in 5 minutes.</p>`
    );

    return res.status(200).json({ message: "OTP sent to your email" });
  }

  const validOtp = await Otp.findOne({ email, otp });
  if (!validOtp) return res.status(400).json({ error: "Invalid OTP" });

  await Otp.deleteMany({ email });

  const token = createTokenForUser(user);
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.salt;

  await sendMail(
    email,
    "Welcome to the Blog App 🎉",
    `<h2>Hi ${user.fullName},</h2><p>Welcome to our Blog App! We're excited to have you on board.</p>`
  );

  res.json({ token, user: userObj });
};

async function logout(req, res) {
  try {
    res.status(200).json({ message: "Logout successful. Please remove token from client." });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { fullName, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullName, email },
      { new: true }
    ).select("-password -salt");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  signup,
  signin,
  logout,
  updateUser,
  deleteUser,
};
