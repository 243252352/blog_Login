const { body } = require("express-validator");

exports.validateSignup = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("otp").notEmpty().withMessage("OTP is required")
];

exports.validateSignin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("otp").notEmpty().withMessage("OTP is required")
];
