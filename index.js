require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication");

const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

const app = express();
const PORT = process.env.port;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

// Routes
app.use("/user", userRouter);
app.use("/blog", blogRouter);

// Root Route
app.get("/", (req, res) => {
    return res.status(200).json({ message: "Welcome to Blogy API!" });
});

// ✅ Start server only after DB connects
async function startServer() {
    try {
        
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ MongoDB connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1); // Exit with failure
    }
}

startServer();
