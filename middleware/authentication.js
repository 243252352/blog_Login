const jwt = require("../services/authentication");
const User = require("../models/user");

function checkForAuthenticationHeader() {
  return async function (req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authentication token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.validateToken(token);

      const user = await User.findById(decoded._id).select("-password -salt");

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = { checkForAuthenticationHeader };
