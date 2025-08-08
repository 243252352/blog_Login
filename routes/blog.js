const { Router } = require("express");
const {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  getBlogThroughTitle,
} = require("../controllers/blog");
const {
  checkForAuthenticationHeader,
} = require("../middleware/authentication");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { blogValidation, updateValidation } = require("../validators/blog");
const router = Router();

router.post(
  "/create",
  checkForAuthenticationHeader(),
  blogValidation,
  validate,
  createBlog
);
router.get("/", getAllBlogs);
router.put(
  "/:id",
  checkForAuthenticationHeader(),
  updateValidation,
  validate,
  updateBlog
);
router.delete("/:id", checkForAuthenticationHeader(), deleteBlog);
router.get("/title/:title", getBlogThroughTitle);

module.exports = router;
