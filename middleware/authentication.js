const jwt = require("../services/authentication");
const {User} = require("../models/user");

function checkForAuthenticationHeader() {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication token missing or invalid" });
      }

      const token = authHeader.split(" ")[1];

      // Validate token and get payload
      const decoded = jwt.validateToken(token); // this should throw if invalid

      // Fetch user from DB and exclude sensitive fields
      const user = await User.findById(decoded._id).select("-password -salt");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Attach full user to request
      req.user = user;
      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = { checkForAuthenticationHeader };
