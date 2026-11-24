
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getProductReviews,
  addProductReview
} = require("../controllers/reviewController");

// Get all reviews for a product (public)
router.get("/:productId", getProductReviews);

// Submit a review (login required)
router.post("/", protect, addProductReview);

module.exports = router;
