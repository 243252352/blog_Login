const Blog = require("../models/blog");

async function getBlogIfOwner(blogId, userId) {
  const blog = await Blog.findById(blogId);
  if (!blog) throw { status: 404, message: "Blog not found" };

  if (blog.createdBy.toString() !== userId.toString()) {
    throw { status: 403, message: "Not owner of the blog" };
  }
  return blog;
}

function extractUpdates(data, fields, originalDoc) {
  const updates = {};
  for (const key of fields) {
    if (data[key] !== undefined && data[key] !== originalDoc[key]) {
      updates[key] = data[key];
    }
  }
  return updates;
}

module.exports = {
  getBlogIfOwner,
  extractUpdates,
};
