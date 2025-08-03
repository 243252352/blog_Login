// controllers/admin.js
const Admin = require("../models/admin");

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json({ admins });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

const changeHandle = async (req, res) => {
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

module.exports = { getAllAdmins, changeHandle };
