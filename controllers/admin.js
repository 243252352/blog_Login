const Admin = require("../models/admin");
const { createTokenForUser } = require("../services/authentication");
const { hashPassword, generateSalt } = require("../models/user");

exports.signup = async (req, res) => {
  const { fullName, email, password, handle } = req.body;
  if (!fullName || !email || !password || !handle) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, admin.salt);
    const newAdmin = await Admin.create({
      fullName,
      email,
      handle,
      salt,
      password: hashedPassword,
    });

    const token = createTokenForUser(newAdmin);
    res.status(201).json({ token, admin: { fullName, email, handle } });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Admin creation failed", details: err.message });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, admin.salt);

    if (hashedPassword !== admin.password)
      return res.status(401).json({ error: "Incorrect password" });

    const token = createTokenForUser(admin);
    res.status(200).json({
      token,
      admin: {
        fullName: admin.fullName,
        email: admin.email,
        handle: admin.handle,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Signin failed", details: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json({ admins });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

exports.changeHandle = async (req, res) => {
  try {
    const { adminId, newHandle } = req.body;

    const existingAdmin = await Admin.findById(adminId);
    if (!existingAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    existingAdmin.handle = newHandle;
    await existingAdmin.save();

    res.status(200).json({ message: "Handle updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change handle" });
  }
};
