

// const Blog = require("../models/blog");
// const { sendMail } = require("../services/mailer");

// async function getBlogThroughTitle(req, res) {
//     const { title } = req.params;

//     if (!title) {
//         return res.status(400).json({ error: "Title is required" });
//     }

//     try {
//         const blog = await Blog.find({ title });

//         if (blog.length === 0) {
//             return res.status(404).json({ error: "No such blogs found" });
//         }

//         return res.status(200).json(blog);
//     } catch (err) {
//         console.error("Get blog by title error:", err);
//         return res.status(500).json({ error: err.message });
//     }
// }

// async function createBlog(req, res) {
//     const { title, body, coverImageURL } = req.body;

//     if (!req.user) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     const missingFields = [];
//     if (!title) missingFields.push("title");
//     if (!body) missingFields.push("body");
//     if (!coverImageURL) missingFields.push("coverImageURL");

//     if (missingFields.length > 0) {
//         return res.status(400).json({
//             status: "error",
//             message: "Missing fields",
//             fields: missingFields,
//         });
//     }

//     try {
//         const blog = await Blog.create({
//             title,
//             body,
//             coverImageURL,
//             createdBy: req.user._id,
//         });

//         // Send email notification to blog owner
//         await sendMail(
//             req.user.email,
//             "New Blog Created",
//             `<h2>Your blog has been published!</h2>
//              <p><strong>Title:</strong> ${title}</p>
//              <p><strong>Body:</strong> ${body.substring(0, 100)}...</p>`
//         );

//         return res.status(201).json(blog);
//     } catch (err) {
//         console.error("Blog creation error:", err);
//         return res.status(500).json({ error: err.message });
//     }
// }

// async function getAllBlogs(req, res) {
//     try {
//         const blogs = await Blog.find().populate("createdBy", "fullName email");
//         return res.status(200).json(blogs);
//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// }

// // async function updateBlog(req, res) {
// //     const blogId = req.params.id;
// //     const { title, body, coverImageURL } = req.body;

// //     if (!req.user) {
// //         return res.status(401).json({ error: "Unauthorized" });
// //     }

// //     try {
// //         const blog = await Blog.findById(blogId);

// //         if (!blog) {
// //             return res.status(404).json({ error: "Blog not found" });
// //         }

// //         if (blog.createdBy.toString() !== req.user._id.toString()) {
// //             return res.status(403).json({ error: "You are not the owner of this blog" });
// //         }

// //         if (title) blog.title = title;
// //         if (body) blog.body = body;
// //         if (coverImageURL) blog.coverImageURL = coverImageURL;

// //         await blog.save();

// //         return res.status(200).json({ message: "Blog updated successfully", blog });
// //     } catch (err) {
// //         console.error("Blog update error:", err.message);
// //         return res.status(500).json({ error: "Internal server error" });
// //     }
// // }

// async function updateBlog(req, res) {
//     const blogId = req.params.id;
//     let { title, body, coverImageURL } = req.body;

//     if (!req.user) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     try {
//         const blog = await Blog.findById(blogId);

//         if (!blog) {
//             return res.status(404).json({ error: "Blog not found" });
//         }

//         if (blog.createdBy.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: "You are not the owner of this blog" });
//         }

//         // ✅ Trim and validate inputs
//         title = title?.trim();
//         body = body?.trim();
//         coverImageURL = coverImageURL?.trim();

//         // ✅ If no fields are provided at all
//         if (!title && !body && !coverImageURL) {
//             return res.status(400).json({ error: "No fields provided for update" });
//         }

//         // ✅ Validate field content
//         const errors = {};
//         if (title !== undefined && title.length < 3) {
//             errors.title = "Title must be at least 3 characters";
//         }

//         if (body !== undefined && body.length < 10) {
//             errors.body = "Body must be at least 10 characters";
//         }

//         if (coverImageURL !== undefined && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(coverImageURL)) {
//             errors.coverImageURL = "Cover image must be a valid image URL";
//         }

//         if (Object.keys(errors).length > 0) {
//             return res.status(400).json({ errors });
//         }

//         // ✅ Apply updates
//         if (title) blog.title = title;
//         if (body) blog.body = body;
//         if (coverImageURL) blog.coverImageURL = coverImageURL;

//         await blog.save();

//         return res.status(200).json({ message: "Blog updated successfully", blog });
//     } catch (err) {
//         console.error("Blog update error:", err.message);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// }


// async function deleteBlog(req, res) {
//     const blogId = req.params.id;

//     if (!req.user) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     try {
//         const blog = await Blog.findById(blogId);

//         if (!blog) {
//             return res.status(404).json({ error: "Blog not found" });
//         }

//         if (blog.createdBy.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: "You are not the owner of this blog" });
//         }

//         await blog.deleteOne();

//         return res.status(200).json({ message: "Blog deleted successfully" });
//     } catch (err) {
//         console.error("Delete blog error:", err.message);
//         return res.status(500).json({ error: err.message });
//     }
// }

// module.exports = {
//     createBlog,
//     getAllBlogs,
//     updateBlog,
//     deleteBlog,
//     getBlogThroughTitle,
// };


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
  const { title, body, coverImageURL } = req.body;

  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const blog = await Blog.findById(blogId);
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  if (blog.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ error: "Not owner of the blog" });

  const noChange =
    (!title || title === blog.title) &&
    (!body || body === blog.body) &&
    (!coverImageURL || coverImageURL === blog.coverImageURL);

  if (noChange) return res.status(400).json({ error: "No changes detected" });

  if (title) blog.title = title;
  if (body) blog.body = body;
  if (coverImageURL) blog.coverImageURL = coverImageURL;

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
