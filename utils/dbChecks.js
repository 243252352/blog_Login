
async function throwIfEmailExists(model, email, res) {
  const existing = await model.findOne({ email });
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return true; // stop execution in controller
  }
  return false;
}

module.exports = { throwIfEmailExists };
