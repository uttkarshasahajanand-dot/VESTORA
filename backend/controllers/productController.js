
const { pool } = require("../config/database");

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT
        p.*,
        c.category_name,
        COALESCE(SUM(pv.stock_quantity), 0) AS total_stock
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      LEFT JOIN product_variants pv
        ON p.product_id = pv.product_id
      WHERE p.status = 'active'
      GROUP BY p.product_id
      ORDER BY p.created_at DESC
    `);

    const productIds = products.map(p => p.product_id);

    let images = [];

    if (productIds.length > 0) {
      const [imageResults] = await pool.query(
        `SELECT image_id, product_id, image_url, is_primary
         FROM product_images
         WHERE product_id IN (?)
         ORDER BY is_primary DESC, image_id ASC`,
        [productIds]
      );

      images = imageResults;
    }

    const productsWithImages = products.map(product => ({
      ...product,
      images: images.filter(
        image => image.product_id === product.product_id
      ),
      total_stock: Number(product.total_stock),
      stock_status: Number(product.total_stock) > 0
        ? "in_stock"
        : "out_of_stock"
    }));

    res.status(200).json({
      success: true,
      count: productsWithImages.length,
      products: productsWithImages
    });

  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};


// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT
         p.*,
         c.category_name,
         COALESCE(SUM(pv.stock_quantity), 0) AS total_stock
       FROM products p
       LEFT JOIN categories c
         ON p.category_id = c.category_id
       LEFT JOIN product_variants pv
         ON p.product_id = pv.product_id
       WHERE p.product_id = ?
       GROUP BY p.product_id`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const [images] = await pool.query(
      `SELECT *
       FROM product_images
       WHERE product_id = ?`,
      [id]
    );

    const [variants] = await pool.query(
      `SELECT *
       FROM product_variants
       WHERE product_id = ?`,
      [id]
    );

    const totalStock = Number(products[0].total_stock);

    res.json({
      success: true,
      product: {
        ...products[0],
        total_stock: totalStock,
        stock_status: totalStock > 0 ? "in_stock" : "out_of_stock",
        images,
        variants
      }
    });

  } catch (error) {
    console.error("Get product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    });
  }
};


// SEARCH PRODUCTS
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required"
      });
    }

    const keyword = `%${q.trim()}%`;

    const [products] = await pool.query(
      `SELECT *
       FROM products
       WHERE product_name LIKE ?
          OR description LIKE ?
       ORDER BY created_at DESC`,
      [keyword, keyword]
    );

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error("Search error:", error.message);

    res.status(500).json({
      success: false,
      message: "Product search failed"
    });
  }
};


// FILTER PRODUCTS BY CATEGORY
exports.getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT
         p.*,
         c.category_name,
         COALESCE(SUM(pv.stock_quantity), 0) AS total_stock
       FROM products p
       LEFT JOIN categories c
         ON p.category_id = c.category_id
       LEFT JOIN product_variants pv
         ON p.product_id = pv.product_id
       WHERE p.category_id = ?
         AND p.status = 'active'
       GROUP BY p.product_id
       ORDER BY p.created_at DESC`,
      [id]
    );

    const productsWithStock = products.map(product => ({
      ...product,
      total_stock: Number(product.total_stock),
      stock_status: Number(product.total_stock) > 0
        ? "in_stock"
        : "out_of_stock"
    }));

    res.json({
      success: true,
      count: productsWithStock.length,
      products: productsWithStock
    });

  } catch (error) {
    console.error("Category products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category products"
    });
  }
};
