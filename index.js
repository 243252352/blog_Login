require("dotenv").config();
const express = require("express");
const { checkForAuthenticationHeader } = require("./middleware/authentication");
const connectDB = require("./db/mongoConnect");
const ServerListening=require("./db/ServerListening");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/blog", checkForAuthenticationHeader(), blogRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Blogy API!" });
});

// Start server after DB connects
async function startServer() {
  try {
    await connectDB();
    await ServerListening(app);
    
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
