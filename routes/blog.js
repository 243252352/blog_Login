const { Router } = require("express");
const Blog = require("../models/blog");
const router = Router();

// Create blog
router.post("/", async (req, res) => {
    const { title, body, coverImageURL } = req.body;

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const blog = await Blog.create({
            title,
            body,
            coverImageURL,
            createdBy: req.user._id,
        });

        return res.status(201).json(blog);
    } catch (err) {
        console.error("Blog creation error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Get all blogs
router.get("/", async (req, res) => {
    const blogs = await Blog.find().populate("createdBy", "fullName email");
    return res.status(200).json(blogs);
});

module.exports = router;
