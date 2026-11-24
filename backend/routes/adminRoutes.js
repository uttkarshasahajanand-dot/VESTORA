
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  getAllCustomers,
  getAnalytics
} = require("../controllers/adminController");

// Protect every admin route
router.use(protect, admin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Update tracking information
router.put("/orders/:id/tracking", updateOrderTracking);

// Customers
router.get("/customers", getAllCustomers);

// Analytics
router.get("/analytics", getAnalytics);

module.exports = router;
