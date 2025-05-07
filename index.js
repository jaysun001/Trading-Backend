const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userAuthRoutes = require('./routes/userAuth')
const adminRoutes = require('./routes/adminRoute')
const userRoutes = require('./routes/userRoute')
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(cors()); // CORS setup
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// API routes
const apiRoutes = express.Router();
app.use("/api", apiRoutes);

apiRoutes.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.use('/api/v1/user/auth', userAuthRoutes)

app.use('/api/v1/admin', adminRoutes)

app.use('/api/v1/user', userRoutes)

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      status: error.status,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;
