
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrderTracking
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

// Place a new order
router.post("/", protect, createOrder);

// Get tracking details of a particular order
router.get("/:orderId/tracking", protect, getOrderTracking);

module.exports = router;
