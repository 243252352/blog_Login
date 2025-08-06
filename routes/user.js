const express = require("express");
const router = express.Router();
const { checkForAuthenticationHeader } = require("../middleware/authentication");
const userController = require("../controllers/user");
const otpController = require("../controllers/otp");
const { validateSignup, validateSignin } = require("../validators/user");

router.post("/signup", validateSignup, userController.signup);
router.post("/signin", validateSignin, userController.signin);
router.post("/logout", userController.logout);
router.put("/:id", checkForAuthenticationHeader(), userController.updateUser);
router.delete("/:id", checkForAuthenticationHeader(), userController.deleteUser);
router.post("/send-otp", otpController.sendOtp);
router.post("/verify-otp", otpController.verifyOtp);
router.post("/resend-otp", otpController.resendOtp);

module.exports = router;
