const { Router } = require("express");
const {
    createBlog,
    getAllBlogs,
    updateBlog,
    deleteBlog
} = require("../controllers/blog");

const router = Router();

router.post("/create", createBlog);
router.get("/", getAllBlogs);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;
