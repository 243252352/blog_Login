const { Router } = require("express");
const {
    createBlog,
    getAllBlogs,
    updateBlog,
    deleteBlog,
    getBlogThroughTitle,
} = require("../controllers/blog");
const { checkForAuthenticationHeader } = require("../middleware/authentication");

const router = Router();

router.post("/create", checkForAuthenticationHeader(), createBlog);
router.get("/", getAllBlogs);
router.put("/:id", checkForAuthenticationHeader(), updateBlog);
router.delete("/:id", checkForAuthenticationHeader(), deleteBlog);
router.get("/title/:title", getBlogThroughTitle);


module.exports = router;
