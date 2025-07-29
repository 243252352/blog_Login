// index.js or app.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const userRouter = require("./routes/user");
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/blogy")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/user", userRouter);

// ✅ ADD THIS: Route for /home
app.get("/home", (req, res) => {
    res.render("home"); // Make sure views/home.ejs exists
});

// Root route (optional)
app.get("/", (req, res) => {
    res.redirect("/user/signin");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
