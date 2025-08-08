
const Blog = require("../models/blog");
const { validationResult } = require("express-validator");
const { sendMail } = require("../services/mailer");

async function createBlog(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { title, body, coverImageURL } = req.body;

  try {
    const blog = await Blog.create({
      title,
      body,
      coverImageURL,
      createdBy: req.user._id,
    });

    await sendMail(
      req.user.email,
      "New Blog Created",
      `<h3>Hello ${req.user.fullName},</h3><p>Your blog titled <strong>${title}</strong> has been created successfully.</p>`
    );

    return res.status(201).json(blog);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


async function updateBlog(req, res) {
  const blogId = req.params.id;
  const updateFields = ['title', 'body', 'coverImageURL']; // easily scalable
  const updates = {};

  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const blog = await Blog.findById(blogId);
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not owner of the blog" });
  }

  // Collect only changed fields
  updateFields.forEach((field) => {
    if (req.body[field] && req.body[field] !== blog[field]) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No changes detected" });
  }

  // Apply updates
  Object.assign(blog, updates);
  await blog.save();

  return res.status(200).json({ message: "Blog updated successfully", blog });
}

async function getAllBlogs(req, res) {
  try {
    const blogs = await Blog.find().populate("createdBy", "fullName email");
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteBlog(req, res) {
  const blogId = req.params.id;

  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const blog = await Blog.findById(blogId);
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  if (blog.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ error: "Not owner of the blog" });

  await blog.deleteOne();
  return res.status(200).json({ message: "Blog deleted successfully" });
}

async function getBlogThroughTitle(req, res) {
  const { title } = req.params;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const blogs = await Blog.find({ title });
    if (!blogs.length) return res.status(404).json({ error: "No blogs found" });

    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  getBlogThroughTitle,
};
