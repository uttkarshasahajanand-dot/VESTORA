
const { pool } = require("../config/database");

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.discount_price,
        p.brand,
        p.status,
        p.category_id,
        c.category_name,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.product_id
          ORDER BY pi.is_primary DESC, pi.image_id ASC
          LIMIT 1
        ) AS image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id DESC
    `);

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};

// ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const {
      product_name,
      description,
      price,
      discount_price,
      brand,
      category_id,
      image_url
    } = req.body;

    if (!product_name || price === undefined || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Product name, price and category are required"
      });
    }

    const productPrice = Number(price);
    const discountPrice =
      discount_price === "" || discount_price == null
        ? null
        : Number(discount_price);

    if (
      !Number.isFinite(productPrice) ||
      productPrice <= 0 ||
      (discountPrice !== null &&
        (!Number.isFinite(discountPrice) ||
          discountPrice < 0 ||
          discountPrice > productPrice))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid product prices"
      });
    }

    const [categories] = await pool.query(
      "SELECT category_id FROM categories WHERE category_id = ?",
      [category_id]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected category does not exist"
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO products
        (product_name, description, price, discount_price, brand, category_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [
          product_name.trim(),
          description || null,
          productPrice,
          discountPrice,
          brand || null,
          category_id
        ]
      );

      if (image_url && image_url.trim()) {
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, is_primary)
           VALUES (?, ?, 1)`,
          [result.insertId, image_url.trim()]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        product_id: result.insertId
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Add product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to add product"
    });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      product_name,
      description,
      price,
      discount_price,
      brand,
      category_id,
      image_url
    } = req.body;

    if (!product_name || price === undefined || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Product name, price and category are required"
      });
    }

    const productPrice = Number(price);
    const discountPrice =
      discount_price === "" || discount_price == null
        ? null
        : Number(discount_price);

    if (
      !Number.isFinite(productPrice) ||
      productPrice <= 0 ||
      (discountPrice !== null &&
        (!Number.isFinite(discountPrice) ||
          discountPrice < 0 ||
          discountPrice > productPrice))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid product prices"
      });
    }

    const [result] = await pool.query(
      `UPDATE products
       SET product_name = ?,
           description = ?,
           price = ?,
           discount_price = ?,
           brand = ?,
           category_id = ?
       WHERE product_id = ?`,
      [
        product_name.trim(),
        description || null,
        productPrice,
        discountPrice,
        brand || null,
        category_id,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (image_url && image_url.trim()) {
      const [images] = await pool.query(
        "SELECT image_id FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, image_id ASC LIMIT 1",
        [id]
      );

      if (images.length > 0) {
        await pool.query(
          "UPDATE product_images SET image_url = ? WHERE image_id = ?",
          [image_url.trim(), images[0].image_id]
        );
      } else {
        await pool.query(
          "INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)",
          [id, image_url.trim()]
        );
      }
    }

    res.json({
      success: true,
      message: "Product updated successfully"
    });

  } catch (error) {
    console.error("Update product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: preserve historical orders and product records.
    const [result] = await pool.query(
      "UPDATE products SET status = 'inactive' WHERE product_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product removed from store successfully"
    });

  } catch (error) {
    console.error("Delete product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
};
