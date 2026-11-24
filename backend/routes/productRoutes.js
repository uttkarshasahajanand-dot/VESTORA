
const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory
} = require("../controllers/productController");

// GET /api/products
router.get("/", getAllProducts);

// GET /api/products/search?q=shirt
router.get("/search", searchProducts);

// GET /api/products/category/:id
router.get("/category/:id", getProductsByCategory);

// GET /api/products/:id
router.get("/:id", getProductById);

module.exports = router;
