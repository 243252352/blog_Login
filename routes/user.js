const { Router } = require("express");
const User = require("../models/user");
const router = Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const user = new User({
            fullName,
            email: email.trim().toLowerCase(),
            password,
        });

        await user.save();
        return res.status(201).json({ message: "User created successfully." });

    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Error creating user." });
    }
});

// SIGNIN
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.MatchPasswordandGenerateToken(email.trim().toLowerCase(), password);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.status(200).json({ message: "Login successful", token });

    } catch (err) {
        return res.status(401).json({ error: "Invalid email or password." });
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully." });
});

module.exports = router;
