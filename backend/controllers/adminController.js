
const { pool } = require("../config/database");

// 1. Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [productResult] = await pool.query(
      "SELECT COUNT(*) AS totalProducts FROM products WHERE status = 'active'"
    );

    const [orderResult] = await pool.query(
      "SELECT COUNT(*) AS totalOrders FROM orders"
    );

    const [customerResult] = await pool.query(
      "SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'"
    );

    const [revenueResult] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue
       FROM orders
       WHERE order_status != 'cancelled'`
    );

    res.json({
      success: true,
      stats: {
        totalProducts: productResult[0].totalProducts,
        totalOrders: orderResult[0].totalOrders,
        totalCustomers: customerResult[0].totalCustomers,
        totalRevenue: Number(revenueResult[0].totalRevenue)
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics"
    });
  }
};


// 2. Get all orders
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT
        o.order_id,
        o.user_id,
        u.name AS customer_name,
        u.email AS customer_email,
        o.total_amount,
        o.order_status,
        o.created_at,
        o.tracking_number,
        o.courier_name,
        o.estimated_delivery,
        o.shipped_at,
        o.delivered_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};


// 3. Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned"
    ];

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const [result] = await pool.query(
      `UPDATE orders
       SET order_status = ?,
           shipped_at = CASE
             WHEN ? = 'shipped' AND shipped_at IS NULL
             THEN NOW()
             ELSE shipped_at
           END,
           delivered_at = CASE
             WHEN ? = 'delivered' AND delivered_at IS NULL
             THEN NOW()
             ELSE delivered_at
           END
       WHERE order_id = ?`,
      [order_status, order_status, order_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully"
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
};


// 4. Update order tracking information
const updateOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      order_status,
      tracking_number,
      courier_name,
      estimated_delivery
    } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned"
    ];

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid order status."
      });
    }

    if (estimated_delivery && !/^\d{4}-\d{2}-\d{2}$/.test(estimated_delivery)) {
      return res.status(400).json({
        success: false,
        message: "Invalid estimated delivery date."
      });
    }

    const [existingOrder] = await pool.query(
      "SELECT order_id FROM orders WHERE order_id = ?",
      [id]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    await pool.query(
      `UPDATE orders
       SET
         order_status = ?,
         tracking_number = ?,
         courier_name = ?,
         estimated_delivery = ?,
         shipped_at = CASE
           WHEN ? IN ('shipped', 'out_for_delivery', 'delivered')
             AND shipped_at IS NULL
           THEN NOW()
           ELSE shipped_at
         END,
         delivered_at = CASE
           WHEN ? = 'delivered' AND delivered_at IS NULL
           THEN NOW()
           ELSE delivered_at
         END
       WHERE order_id = ?`,
      [
        order_status,
        tracking_number || null,
        courier_name || null,
        estimated_delivery || null,
        order_status,
        order_status,
        id
      ]
    );

    res.json({
      success: true,
      message: "Order tracking information updated successfully."
    });

  } catch (error) {
    console.error("Update tracking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update tracking information."
    });
  }
};


// 5. Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(
          CASE
            WHEN o.order_status != 'cancelled' THEN o.total_amount
            ELSE 0
          END
        ), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.user_id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.user_id, u.name, u.email, u.phone, u.created_at
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      customers
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers"
    });
  }
};


// 6. Get analytics
const getAnalytics = async (req, res) => {
  try {
    const [monthlySales] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*) AS total_orders
      FROM orders
      WHERE order_status != 'cancelled'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    const [ordersByStatus] = await pool.query(`
      SELECT
        order_status,
        COUNT(*) AS total
      FROM orders
      GROUP BY order_status
      ORDER BY total DESC
    `);

    const [topProducts] = await pool.query(`
      SELECT
        oi.product_name,
        SUM(oi.quantity) AS total_sold,
        SUM(oi.quantity * oi.price) AS total_revenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.order_id
      WHERE o.order_status != 'cancelled'
      GROUP BY oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      analytics: {
        monthlySales,
        ordersByStatus,
        topProducts
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics"
    });
  }
};


module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  getAllCustomers,
  getAnalytics
};
