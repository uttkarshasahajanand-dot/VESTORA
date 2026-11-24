
const { pool } = require("../config/database");

// Create a new order
const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.user_id;

    const {
      full_name,
      phone,
      address_line,
      city,
      state,
      pincode,
      items
    } = req.body;

    if (
      !full_name ||
      !phone ||
      !address_line ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all delivery details."
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty."
      });
    }

    await connection.beginTransaction();

    const [addressResult] = await connection.query(
      `INSERT INTO addresses
       (user_id, full_name, phone, address_line, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, full_name, phone, address_line, city, state, pincode]
    );

    const addressId = addressResult.insertId;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid product quantity.");
      }

      const [products] = await connection.query(
        `SELECT product_id, product_name, price, discount_price
         FROM products
         WHERE product_id = ? AND status = 'active'`,
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.product_id} is unavailable.`);
      }

      const product = products[0];

      const price = Number(
        product.discount_price || product.price
      );

      totalAmount += price * quantity;

      orderItems.push({
        product_name: product.product_name,
        quantity,
        price
      });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (user_id, address_id, total_amount, order_status)
       VALUES (?, ?, ?, 'pending')`,
      [userId, addressId, totalAmount]
    );

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.product_name,
          item.quantity,
          item.price
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Your order has been placed successfully!",
      order_id: orderId,
      total_amount: totalAmount
    });

  } catch (error) {
    await connection.rollback();

    console.error("Order Error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message || "Unable to place order."
    });

  } finally {
    connection.release();
  }
};


// Get tracking details of customer's order
const getOrderTracking = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orderId = req.params.orderId;

    const [orders] = await pool.query(
      `SELECT
        o.order_id,
        o.total_amount,
        o.order_status,
        o.created_at,
        o.tracking_number,
        o.courier_name,
        o.estimated_delivery,
        o.shipped_at,
        o.delivered_at,
        a.full_name,
        a.phone,
        a.address_line,
        a.city,
        a.state,
        a.pincode
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.address_id
       WHERE o.order_id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    const order = orders[0];

    const statusSteps = [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered"
    ];

    const currentStep = statusSteps.indexOf(order.order_status);

    res.status(200).json({
      success: true,
      order,
      tracking: {
        status_steps: statusSteps,
        current_step: currentStep,
        is_cancelled: order.order_status === "cancelled",
        is_returned: order.order_status === "returned"
      }
    });

  } catch (error) {
    console.error("Tracking Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch order tracking details."
    });
  }
};


module.exports = {
  createOrder,
  getOrderTracking
};
