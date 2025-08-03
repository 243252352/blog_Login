// const jwt = require("jsonwebtoken");
// const Admin = require("../models/admin");

// const checkAuthorizationHeaders = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ error: "Token missing from headers" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.adminId = decoded._id;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// };

// const authenticateAdmin = async (req, res, next) => {
//   try {
//     const admin = await Admin.findById(req.adminId).select("-password -salt");
//     if (!admin) {
//       return res.status(403).json({ error: "Unauthorized admin" });
//     }

//     req.admin = admin;
//     next();
//   } catch (error) {
//     return res.status(500).json({ error: "Admin authentication failed" });
//   }
// };

// const validateRequestBody = (req, res, next) => {
//   if (!req.body || Object.keys(req.body).length === 0) {
//     return res.status(400).json({ error: "Request body is missing" });
//   }
//   next();
// };

// const checkChangeHandleRequest = (req, res, next) => {
//   const { adminId, newHandle } = req.body;
//   if (!adminId || !newHandle) {
//     return res.status(400).json({ error: "adminId and newHandle are required" });
//   }
//   next();
// };

// module.exports = {
//   checkAuthorizationHeaders,
//   authenticateAdmin,
//   validateRequestBody,
//   checkChangeHandleRequest,
// };
// middleware/adminValidation.js

const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

// 1️⃣ Check headers for token
const checkAuthorizationHeaders = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded._id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 2️⃣ Authenticate admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password -salt");

    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Authentication failed" });
  }
};

// 3️⃣ Check if new handle is valid
const checkChangeHandleRequest = async (req, res, next) => {
  const { newHandle } = req.body;

  if (!newHandle || typeof newHandle !== "string") {
    return res.status(400).json({ error: "Invalid handle provided" });
  }

  const existing = await Admin.findOne({ handle: newHandle });
  if (existing) {
    return res.status(409).json({ error: "Handle already taken" });
  }

  next();
};

// 4️⃣ Validate request body exists
const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is missing" });
  }
  next();
};

// 👇 Export all middlewares
module.exports = {
  checkAuthorizationHeaders,
  authenticateAdmin,
  checkChangeHandleRequest,
  validateRequestBody,
};
