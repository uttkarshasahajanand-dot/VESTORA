
const { pool } = require("../config/database");

// Get orders belonging to the logged-in customer
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch customer orders
    const [orders] = await pool.query(
      `SELECT
        o.order_id,
        o.total_amount,
        o.order_status,
        o.created_at,
        a.full_name,
        a.phone,
        a.address_line,
        a.city,
        a.state,
        a.pincode
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.address_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [userId]
    );

    // Fetch products for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT
          order_item_id,
          product_name,
          size,
          color,
          quantity,
          price
        FROM order_items
        WHERE order_id = ?`,
        [order.order_id]
      );

      order.items = items;
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("My Orders Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your orders."
    });
  }
};

module.exports = { getMyOrders };
