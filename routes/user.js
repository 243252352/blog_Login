const express = require("express");
const router = express.Router();
const { checkForAuthenticationCookie } = require("../middleware/authentication");
const userController = require("../controllers/user");
const otpController = require("../controllers/otp");

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.post("/logout", userController.logout);
router.put("/:id", checkForAuthenticationCookie("token"), userController.updateUser);
router.delete("/:id", checkForAuthenticationCookie("token"), userController.deleteUser);
router.post("/send-otp", otpController.sendOtp);
router.post("/verify-otp", otpController.verifyOtp);
router.post("/resend-otp", otpController.resendOtp);
module.exports = router;
