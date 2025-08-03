// controllers/userController.js
const crypto = require("crypto");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");

// Signup
exports.signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

        const user = new User({
            fullName,
            email: email.trim().toLowerCase(),
            salt,
            password: hashedPassword
        });

        await user.save();
        return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

// Signin
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const hashedPassword = crypto
            .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
            .toString("hex");

        if (user.password !== hashedPassword) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = createTokenForUser(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        const { password: _, salt, ...userWithoutPassword } = user.toObject();

        return res.status(200).json({
            message: "Login successful",
            token,
            user: userWithoutPassword,
        });
    } catch (err) {
        console.error("Signin error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully." });
};

// Update User
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, password } = req.body;

    if (req.user._id.toString() !== id) {
        return res.status(403).json({ error: "Unauthorized to update this user" });
    }

    try {
        const updateData = {};

        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email.trim().toLowerCase();
        if (password) {
            const salt = crypto.randomBytes(16).toString("hex");
            const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
            updateData.password = hashedPassword;
            updateData.salt = salt;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password -salt");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const newToken = createTokenForUser(updatedUser);

        return res.status(200).json({
            message: "User updated successfully",
            token: newToken,
            user: updatedUser
        });

    } catch (err) {
        console.error("User update error:", err);
        return res.status(500).json({ error: err.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    const userIdFromToken = req.user._id.toString();
    const userIdFromParam = req.params.id;

    if (userIdFromToken !== userIdFromParam) {
        return res.status(403).json({ error: "You are not authorized to delete this account" });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(userIdFromParam);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
