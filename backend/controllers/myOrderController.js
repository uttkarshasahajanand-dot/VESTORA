
const { pool } = require("../config/database");

// GET ORDERS BELONGING TO THE LOGGED-IN CUSTOMER
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;

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
       LEFT JOIN addresses a
         ON o.address_id = a.address_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // FETCH PRODUCTS AND VARIANT INFORMATION FOR EACH ORDER
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT
          oi.order_item_id,
          pv.product_id,
          oi.variant_id,
          oi.product_name,
          oi.size,
          oi.color,
          oi.quantity,
          oi.price
         FROM order_items oi
         LEFT JOIN product_variants pv
           ON oi.variant_id = pv.variant_id
         WHERE oi.order_id = ?`,
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
