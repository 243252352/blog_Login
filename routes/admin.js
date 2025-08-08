const express = require("express");
const router = express.Router();

const {
  signup,
  signin,
  getAllAdmins,
  changeHandle,
} = require("../controllers/admin");

const {
  checkAuthorizationHeaders,
  authenticateAdmin,
  checkChangeHandleRequest,
  validateRequestBody,
} = require("../middleware/adminValidation");

// Public routes
router.post("/signup", signup);
router.post("/signin", signin);

// Protected routes
router.get("/", checkAuthorizationHeaders, authenticateAdmin, getAllAdmins);

router.put(
  "/change-handle",
  checkAuthorizationHeaders,
  authenticateAdmin,
  validateRequestBody,
  checkChangeHandleRequest,
  changeHandle
);

module.exports = router;
