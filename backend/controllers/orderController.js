
const { pool } = require("../config/database");

// CREATE A NEW ORDER
const createOrder = async (req, res) => {
  let connection;

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

    connection = await pool.getConnection();
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
      const productId = Number(item.product_id);
      const variantId = Number(item.variant_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId < 1 ||
        !Number.isInteger(variantId) ||
        variantId < 1 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error("Invalid product, variant or quantity.");
      }

      // Validate product and lock selected variant stock
      const [variants] = await connection.query(
        `SELECT
           pv.variant_id,
           pv.product_id,
           pv.size,
           pv.color,
           pv.stock_quantity,
           p.product_name,
           p.price,
           p.discount_price
         FROM product_variants pv
         JOIN products p ON p.product_id = pv.product_id
         WHERE pv.variant_id = ?
           AND pv.product_id = ?
           AND p.status = 'active'
         FOR UPDATE`,
        [variantId, productId]
      );

      if (variants.length === 0) {
        throw new Error("Selected product variant is unavailable.");
      }

      const variant = variants[0];

      if (Number(variant.stock_quantity) < quantity) {
        throw new Error(
          `Insufficient stock for ${variant.product_name} (${variant.size}, ${variant.color}).`
        );
      }

      const price = Number(
        variant.discount_price || variant.price
      );

      totalAmount += price * quantity;

      orderItems.push({
        product_id: productId,
        variant_id: variantId,
        product_name: variant.product_name,
        size: variant.size,
        color: variant.color,
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
         (order_id, variant_id, product_name, size, color, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.variant_id,
          item.product_name,
          item.size,
          item.color,
          item.quantity,
          item.price
        ]
      );

      // Reduce stock after successful order item insertion
      await connection.query(
        `UPDATE product_variants
         SET stock_quantity = stock_quantity - ?
         WHERE variant_id = ?`,
        [item.quantity, item.variant_id]
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
    if (connection) {
      await connection.rollback();
    }

    console.error("Order Error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message || "Unable to place order."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// GET CUSTOMER ORDER TRACKING
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
