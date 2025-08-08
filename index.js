require("dotenv").config();
const express = require("express");
const { checkForAuthenticationHeader } = require("./middleware/authentication");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const otpRoutes = require("./routes/user");
const connectDB = require("./db/mongoConnect");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/admin", adminRouter);
app.use("/otp", otpRoutes);
app.use("/user", userRouter);
app.use("/blog", checkForAuthenticationHeader(), blogRouter);

// Root Route
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Blogy API!" });
});

// ✅ Start server only after DB connects
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error({ err: err.message });
    process.exit(1); // Exit with failure
  }
}

startServer();
