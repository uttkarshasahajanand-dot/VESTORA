
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { testDatabaseConnection } = require("./config/database");

// Import routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const myOrderRoutes = require("./routes/myOrderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://vestora-pink.vercel.app",
  "https://vestora-hvdvcrzb0-uttkarshasahajanand-4843.vercel.app"
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/my-orders", myOrderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/reviews", reviewRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to VESTORA API",
    status: "Server is running"
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// Local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  async function startServer() {
    try {
      await testDatabaseConnection();

      app.listen(PORT, () => {
        console.log("VESTORA BACKEND STARTED");
        console.log(`Server: http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("Server startup failed:", error.message);
      process.exit(1);
    }
  }

  startServer();
}

// Export Express app for Vercel
module.exports = app;
