const { body } = require("express-validator");

exports.validateBlogCreation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("body").notEmpty().withMessage("Body is required"),
  body("coverImageURL").optional().isURL().withMessage("Cover image must be a valid URL"),
];

exports.validateBlogUpdate = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("body").optional().notEmpty().withMessage("Body cannot be empty"),
  body("coverImageURL").optional().isURL().withMessage("Cover image must be a valid URL"),
];
