
const { pool } = require("../config/database");

// GET REVIEWS FOR A PRODUCT
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const [reviews] = await pool.query(
      `SELECT
          r.review_id,
          r.product_id,
          r.rating,
          r.review_title,
          r.review_comment,
          r.created_at,
          u.name AS customer_name
       FROM product_reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const [summary] = await pool.query(
      `SELECT
          COUNT(*) AS total_reviews,
          COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating
       FROM product_reviews
       WHERE product_id = ?`,
      [productId]
    );

    res.status(200).json({
      success: true,
      summary: summary[0],
      reviews
    });

  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
};


// ADD A PRODUCT REVIEW
const addProductReview = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const {
      product_id,
      order_id,
      rating,
      review_title,
      review_comment
    } = req.body;

    if (!product_id || !order_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Product, order and rating are required"
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Verify that the customer purchased this product
    // and the order has been delivered.
    const [purchases] = await pool.query(
      `SELECT oi.order_item_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       JOIN product_variants pv ON oi.variant_id = pv.variant_id
       WHERE o.order_id = ?
         AND o.user_id = ?
         AND o.order_status = 'delivered'
         AND pv.product_id = ?
       LIMIT 1`,
      [order_id, userId, product_id]
    );

    if (purchases.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can review only products from your delivered orders"
      });
    }

    // Prevent duplicate reviews for the same order.
    const [existing] = await pool.query(
      `SELECT review_id
       FROM product_reviews
       WHERE user_id = ?
         AND product_id = ?
         AND order_id = ?`,
      [userId, product_id, order_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product for this order"
      });
    }

    await pool.query(
      `INSERT INTO product_reviews
       (product_id, user_id, order_id, rating, review_title, review_comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        userId,
        order_id,
        numericRating,
        review_title?.trim() || null,
        review_comment?.trim() || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully"
    });

  } catch (error) {
    console.error("Add review error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product for this order"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit review"
    });
  }
};


module.exports = {
  getProductReviews,
  addProductReview
};
