const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

const app = express();
const PORT = 3000;

// MongoDB
mongoose.connect("mongodb://localhost:27017/blogy")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // ✅ Accept JSON bodies
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

// Routes
app.use("/user", userRouter);
app.use("/blog", blogRouter);

// Home route
app.get("/home", (req, res) => {
    return res.status(200).json({ message: "Welcome to Home", user: req.user || null });
});

// Default route
app.get("/", (req, res) => {
    return res.status(200).json({ message: "API is live. Use /user/signup or /user/signin" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
