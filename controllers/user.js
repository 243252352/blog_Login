// const crypto = require("crypto");
// const User = require("../models/user");
// const { createTokenForUser } = require("../services/authentication");
// const { sendMail } = require("../services/mailer");
// const Otp = require("../models/otp");
// const { validateRequiredFields } = require("../utils/validateRequest");

// async function signup(req, res) {
//   try {
//     const { fullName, email, password, otp } = req.body;

//     if (!otp) {
//       const validationError = validateRequiredFields(req.body, ["fullName", "email", "password"]);
//       if (validationError) return res.status(400).json(validationError);
//     } else {
//       const validationError = validateRequiredFields(req.body, ["email", "otp"]);
//       if (validationError) return res.status(400).json(validationError);
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ error: "Email already exists" });

//     if (!otp) {
//       const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

//       await Otp.deleteMany({ email });
//       await Otp.create({ email, otp: generatedOtp });

//       await sendMail(email, "Your OTP for Blog App Signup", `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
//           <h2 style="color: #4CAF50;">Verify Your Email</h2>
//           <p>Hello ${fullName || "there"},</p>
//           <p>Use the OTP below to complete your signup on <strong>Blog App</strong>:</p>
//           <p style="font-size: 18px; font-weight: bold;">${generatedOtp}</p>
//           <p>This OTP is valid for <strong>5 minutes</strong>.</p>
//           <p>If you didn't request this, please ignore this email.</p>
//           <br />
//           <p>— Blog App Team</p>
//         </div>
//       `);

//       return res.status(200).json({ message: "OTP sent to your email" });
//     }

//     const validOtp = await Otp.findOne({ email, otp });
//     if (!validOtp) return res.status(400).json({ error: "Invalid OTP" });

//     await Otp.deleteMany({ email });

//     const salt = crypto.randomBytes(16).toString("hex");
//     const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

//     const newUser = new User({ fullName, email, password: hashedPassword, salt });
//     await newUser.save();

//     const token = createTokenForUser(newUser);

//     await sendMail(email, "Welcome to the Blog App 🎉", `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2 style="color: #4CAF50;">Hi ${fullName},</h2>
//         <p>Welcome to <strong>Blog App</strong>! We're thrilled to have you here.</p>
//         <p>Start creating and sharing your thoughts with the world.</p>
//         <br />
//         <p>Happy blogging!<br />— The Blog App Team</p>
//       </div>
//     `);

//     res.status(201).json({
//       message: "User created successfully",
//       user: {
//         _id: newUser._id,
//         fullName: newUser.fullName,
//         email: newUser.email,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// async function signin(req, res) {
//   try {
//     const { email, password, otp } = req.body;

//     if (!otp) {
//       const validationError = validateRequiredFields(req.body, ["email", "password"]);
//       if (validationError) return res.status(400).json(validationError);
//     } else {
//       const validationError = validateRequiredFields(req.body, ["email", "otp"]);
//       if (validationError) return res.status(400).json(validationError);
//     }

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const hashedInputPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, "sha512").toString("hex");
//     if (user.password !== hashedInputPassword) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     if (!otp) {
//       const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

//       await Otp.deleteMany({ email });
//       await Otp.create({ email, otp: generatedOtp });

//       await sendMail(email, "Your OTP for Blog App Login", `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
//           <h2 style="color: #4CAF50;">Verify Your Login</h2>
//           <p>Hello ${user.fullName || "there"},</p>
//           <p>Use the OTP below to log in to your <strong>Blog App</strong> account:</p>
//           <p style="font-size: 18px; font-weight: bold;">${generatedOtp}</p>
//           <p>This OTP is valid for <strong>5 minutes</strong>.</p>
//           <p>If you didn’t try to log in, please ignore this email.</p>
//           <br />
//           <p>— Blog App Team</p>
//         </div>
//       `);

//       return res.status(200).json({ message: "OTP sent to your email" });
//     }

//     const validOtp = await Otp.findOne({ email, otp });
//     if (!validOtp) return res.status(400).json({ error: "Invalid OTP" });

//     await Otp.deleteMany({ email });

//     const token = createTokenForUser(user);
//     const userObj = user.toObject();
//     delete userObj.password;
//     delete userObj.salt;

//     await sendMail(email, "Welcome Back to Blog App ✨", `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2 style="color: #4CAF50;">Hi ${user.fullName},</h2>
//         <p>Welcome back to <strong>Blog App</strong>!</p>
//         <p>We’re glad to see you again. Ready to continue your blogging journey?</p>
//         <br />
//         <p>Happy blogging!<br />— The Blog App Team</p>
//       </div>
//     `);

//     res.json({ token, user: userObj });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// async function logout(req, res) {
//   try {
//     res.status(200).json({ message: "Logout successful. Please remove token from client." });
//   } catch (err) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// async function updateUser(req, res) {
//   try {
//     const { id } = req.params;
//     const { fullName, email } = req.body;

//     const validationError = validateRequiredFields(req.body, ["fullName", "email"]);
//     if (validationError) return res.status(400).json(validationError);

//     if (req.user._id.toString() !== id) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { fullName, email },
//       { new: true }
//     ).select("-password -salt");

//     res.status(200).json({
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// async function deleteUser(req, res) {
//   try {
//     const { id } = req.params;

//     if (!id) return res.status(400).json({ error: "User ID is required" });

//     if (req.user._id.toString() !== id) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     await User.findByIdAndDelete(id);

//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// module.exports = {
//   signup,
//   signin,
//   logout,
//   updateUser,
//   deleteUser,
// };


const crypto = require("crypto");
const User = require("../models/user");
const Otp = require("../models/otp");
const { createTokenForUser } = require("../services/authentication");
const { sendMail } = require("../services/mailer");
const { validationResult } = require("express-validator");

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

  return res.status(201).json({ message: "User created successfully", user });
}

async function signin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, otp } = req.body;

  const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!existingOtp || existingOtp.otp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    await Otp.deleteMany({ email });

    return res.status(200).json({ message: "Signin successful", token });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

async function logout(req, res) {
  return res.status(200).json({ message: "Logout successful" });
}

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
