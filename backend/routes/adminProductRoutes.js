
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/adminProductController");

// All routes require admin authentication
router.use(protect, admin);

router.get("/", getAllProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
