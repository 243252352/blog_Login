const Blog = require("../models/blog");

async function createBlog(req, res) {
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
        return res.status(500).json({ error: err.message });
    }
}

async function getAllBlogs(req, res) {
    try {
        const blogs = await Blog.find().populate("createdBy", "fullName email");
        return res.status(200).json(blogs);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function updateBlog(req, res) {
    const blogId = req.params.id;
    const { title, body, coverImageURL } = req.body;

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not the owner of this blog" });
        }

        if (title) blog.title = title;
        if (body) blog.body = body;
        if (coverImageURL) blog.coverImageURL = coverImageURL;

        await blog.save();

        return res.status(200).json({ message: "Blog updated successfully", blog });
    } catch (err) {
        console.error("Blog update error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteBlog(req, res) {
    const blogId = req.params.id;

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not the owner of this blog" });
        }

        await blog.deleteOne();

        return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (err) {
        console.error("Delete blog error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createBlog,
    getAllBlogs,
    updateBlog,
    deleteBlog,
};
