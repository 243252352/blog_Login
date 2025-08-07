const mongoose = require("mongoose");
const crypto = require("crypto");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    salt: { type: String, required: true },
    password: { type: String, required: true }
});

// Function to hash password
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

// Add method to generate JWT
userSchema.statics.matchPasswordAndGenerateToken = async function (email, plainPassword) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    const hashedInputPassword = hashPassword(plainPassword, user.salt);

    if (hashedInputPassword !== user.password) {
        throw new Error("Invalid password");
    }

    const token = createTokenForUser(user);
    return token;
};

const User = mongoose.model("User", userSchema);

// Export both User and hashPassword
module.exports = {
    User,
    hashPassword
};
