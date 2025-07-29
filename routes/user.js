const { Router } = require("express");
const User = require("../models/user");
const router = Router();

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.get("/signin", (req, res) => {
    return res.render("signin");
});

// SIGNUP
router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).send("Email already exists.");
        }

        const user = new User({
            fullName,
            email: email.trim().toLowerCase(),
            password,
        });

        await user.save();
        return res.redirect("/home");

    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).send("Error creating user.");
    }
});

// SIGNIN
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.matchPassword(email.trim().toLowerCase(), password);

        if (user) {
            return res.redirect("/home");
        } else {
            return res.status(401).send("Invalid email or password.");
        }

    } catch (err) {
        console.error("Signin error:", err.message);
        return res.status(500).send("Error logging in.");
    }
});

module.exports = router;
