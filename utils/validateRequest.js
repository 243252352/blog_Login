// utils/validateRequest.js
function validateRequiredFields(body, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (!body[field]) {
      missing.push(field);
    }
  }

  if (missing.length) {
    return {
      status: "error",
      message: "missing fields",
      fields: missing,
    };
  }

  return null;
}

module.exports = { validateRequiredFields };
