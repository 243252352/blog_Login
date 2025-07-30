const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName]; // ✅ use the argument

    if (!tokenCookieValue) {
      return next(); // ⚠️ you forgot `return` here
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {
      req.user = null; // optional: set user to null on error
    }

    next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
