
const express = require("express");
const router = express.Router();

const { getMyOrders } = require("../controllers/myOrderController");
const { protect } = require("../middleware/authMiddleware");

// Only logged-in customers can view their orders
router.get("/", protect, getMyOrders);

module.exports = router;
