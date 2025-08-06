
const { Router } = require("express");
const {
    createBlog,
    getAllBlogs,
    updateBlog,
    deleteBlog,
    getBlogThroughTitle,
} = require("../controllers/blog");
const { checkForAuthenticationHeader } = require("../middleware/authentication");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

const router = Router();

// Blog creation validation
const blogValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("body").notEmpty().withMessage("Body content is required"),
    body("coverImageURL").optional().isURL().withMessage("Cover image must be a valid URL"),
];

// Blog update validation (fields are optional but must be valid if present)
const updateValidation = [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("body").optional().notEmpty().withMessage("Body cannot be empty"),
    body("coverImageURL").optional().isURL().withMessage("Cover image must be a valid URL"),
];

router.post("/create", checkForAuthenticationHeader(), blogValidation, validate, createBlog);
router.get("/", getAllBlogs);
router.put("/:id", checkForAuthenticationHeader(), updateValidation, validate, updateBlog);
router.delete("/:id", checkForAuthenticationHeader(), deleteBlog);
router.get("/title/:title", getBlogThroughTitle);

module.exports = router;
