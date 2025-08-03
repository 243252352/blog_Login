const express = require("express");
const crypto = require("crypto");
const Admin = require("../models/admin");
const { createTokenForUser } = require("../services/authentication");
const router = express.Router();

const {
  getAllAdmins,
  changeHandle,
} = require("../controllers/admin");

const {
  checkAuthorizationHeaders,
  authenticateAdmin,
  checkChangeHandleRequest,
  validateRequestBody,
} = require("../middleware/adminValidation");

// Signup (creates admin and returns token)
router.post("/signup", async (req, res) => {
  const { fullName, email, password, handle } = req.body;
  if (!fullName || !email || !password || !handle) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
      .toString(`hex`);

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
    res.status(500).json({ error: "Admin creation failed", details: err.message });
  }
});

// Signin (verifies password, returns token)
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const hashedPassword = crypto
      .pbkdf2Sync(password, admin.salt, 1000, 64, `sha512`)
      .toString(`hex`);

    if (hashedPassword !== admin.password)
      return res.status(401).json({ error: "Incorrect password" });

    const token = createTokenForUser(admin);
    res.status(200).json({ token, admin: { fullName: admin.fullName, email: admin.email, handle: admin.handle } });
  } catch (err) {
    res.status(500).json({ error: "Signin failed", details: err.message });
  }
});

// Protected routes below
router.get(
  "/",
  checkAuthorizationHeaders,
  authenticateAdmin,
  getAllAdmins
);

router.put(
  "/change-handle",
  checkAuthorizationHeaders,
  authenticateAdmin,
  validateRequestBody,
  checkChangeHandleRequest,
  changeHandle
);

module.exports = router;
