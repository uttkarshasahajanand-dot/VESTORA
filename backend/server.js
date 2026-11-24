
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
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
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

// Start Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log("--------------------------------");
      console.log("VESTORA BACKEND STARTED");
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Products: http://localhost:${PORT}/api/products`);
      console.log(`Auth: http://localhost:${PORT}/api/auth`);
      console.log(`Orders: http://localhost:${PORT}/api/orders`);
      console.log("--------------------------------");
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
