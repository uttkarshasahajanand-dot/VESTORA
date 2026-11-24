
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  RefreshCw,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Save,
  MapPin,
  CalendarDays
} from "lucide-react";
import API from "../services/api";

const ORDER_STATUSES = [
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

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [savingTracking, setSavingTracking] = useState(null);

  const [trackingForms, setTrackingForms] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/orders");
      const fetchedOrders = response.data.orders || [];

      setOrders(fetchedOrders);

      const forms = {};

      fetchedOrders.forEach((order) => {
        forms[order.order_id] = {
          order_status: order.order_status || "pending",
          tracking_number: order.tracking_number || "",
          courier_name: order.courier_name || "",
          estimated_delivery: order.estimated_delivery
            ? String(order.estimated_delivery).slice(0, 10)
            : ""
        };
      });

      setTrackingForms(forms);
    } catch (err) {
      console.error("Orders error:", err);
      setError(
        err.response?.data?.message || "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateForm = (orderId, field, value) => {
    setTrackingForms((previous) => ({
      ...previous,
      [orderId]: {
        ...previous[orderId],
        [field]: value
      }
    }));
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);

      await API.put(`/admin/orders/${orderId}/status`, {
        order_status: status
      });

      setOrders((previous) =>
        previous.map((order) =>
          order.order_id === orderId
            ? { ...order, order_status: status }
            : order
        )
      );

      setTrackingForms((previous) => ({
        ...previous,
        [orderId]: {
          ...previous[orderId],
          order_status: status
        }
      }));

      alert("Order status updated successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Could not update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const saveTracking = async (orderId) => {
    try {
      setSavingTracking(orderId);

      const form = trackingForms[orderId];

      await API.put(`/admin/orders/${orderId}/tracking`, {
        order_status: form.order_status,
        tracking_number: form.tracking_number.trim(),
        courier_name: form.courier_name.trim(),
        estimated_delivery: form.estimated_delivery || null
      });

      setOrders((previous) =>
        previous.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                order_status: form.order_status,
                tracking_number: form.tracking_number.trim(),
                courier_name: form.courier_name.trim(),
                estimated_delivery: form.estimated_delivery || null
              }
            : order
        )
      );

      alert("Tracking information saved successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Could not save tracking information."
      );
    } finally {
      setSavingTracking(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return orders.filter((order) =>
      String(order.order_id).includes(searchText) ||
      (order.customer_name || "").toLowerCase().includes(searchText) ||
      (order.customer_email || "").toLowerCase().includes(searchText) ||
      (order.tracking_number || "").toLowerCase().includes(searchText)
    );
  }, [orders, search]);

  const getCount = (status) =>
    orders.filter((order) => order.order_status === status).length;

  const totalRevenue = orders
    .filter((order) => !["cancelled", "returned"].includes(order.order_status))
    .reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0
    );

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "-";

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const getStatusClass = (status) =>
    `luxury-order-status status-${String(status || "pending").toLowerCase()}`;

  return (
    <div className="luxury-orders">

      <div className="luxury-orders-header">
        <div>
          <span className="luxury-eyebrow">STORE MANAGEMENT</span>
          <h2>Orders Management</h2>
          <p>Track, manage and monitor all customer orders.</p>
        </div>

        <button
          className="luxury-refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "luxury-spin" : ""}
          />
          Refresh Orders
        </button>
      </div>

      <div className="luxury-order-stats">

        <div className="luxury-order-stat">
          <div className="luxury-order-stat-icon">
            <ShoppingCart size={21} />
          </div>
          <div>
            <span>Total Orders</span>
            <h3>{orders.length}</h3>
          </div>
        </div>

        <div className="luxury-order-stat">
          <div className="luxury-order-stat-icon pending-icon">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending Orders</span>
            <h3>{getCount("pending")}</h3>
          </div>
        </div>

        <div className="luxury-order-stat">
          <div className="luxury-order-stat-icon shipped-icon">
            <Truck size={21} />
          </div>
          <div>
            <span>Shipped Orders</span>
            <h3>{getCount("shipped") + getCount("out_for_delivery")}</h3>
          </div>
        </div>

        <div className="luxury-order-stat">
          <div className="luxury-order-stat-icon delivered-icon">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Delivered Orders</span>
            <h3>{getCount("delivered")}</h3>
          </div>
        </div>

        <div className="luxury-order-stat">
          <div className="luxury-order-stat-icon revenue-icon">
            <Package size={21} />
          </div>
          <div>
            <span>Order Value</span>
            <h3>₹{formatAmount(totalRevenue)}</h3>
          </div>
        </div>

      </div>

      <div className="luxury-orders-panel">

        <div className="luxury-orders-panel-header">
          <div>
            <h3>All Orders</h3>
            <p>
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>

          <div className="luxury-order-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search orders, customers or tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="luxury-orders-message">
            <RefreshCw className="luxury-spin" size={25} />
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="luxury-orders-message luxury-orders-error">
            <XCircle size={30} />
            <p>{error}</p>
            <button onClick={fetchOrders}>Try Again</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="luxury-orders-message">
            <ShoppingCart size={38} />
            <h3>No Orders Found</h3>
            <p>
              {search
                ? "Try another order ID, customer name or tracking number."
                : "Customer orders will appear here."}
            </p>
          </div>
        ) : (
          <div className="luxury-orders-table-wrapper">
            <table className="luxury-orders-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>CUSTOMER</th>
                  <th>EMAIL ADDRESS</th>
                  <th>ORDER VALUE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>QUICK STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <span className="luxury-order-id">
                        #{order.order_id}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-customer-name">
                        {order.customer_name || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-customer-email">
                        {order.customer_email || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-order-amount">
                        ₹{formatAmount(order.total_amount)}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-order-date">
                        {formatDate(order.created_at)}
                      </span>
                    </td>

                    <td>
                      <span className={getStatusClass(order.order_status)}>
                        {(order.order_status || "pending").replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      <select
                        value={order.order_status || "pending"}
                        disabled={updatingOrder === order.order_id}
                        onChange={(e) =>
                          updateStatus(order.order_id, e.target.value)
                        }
                        className="luxury-order-status-select"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>

                      {updatingOrder === order.order_id && (
                        <span className="luxury-updating-text">
                          Updating...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="luxury-tracking-section">
          <div className="luxury-tracking-heading">
            <div>
              <span className="luxury-eyebrow">DELIVERY MANAGEMENT</span>
              <h3>Shipment & Tracking Details</h3>
              <p>
                Add courier and delivery information for customer order tracking.
              </p>
            </div>
          </div>

          <div className="luxury-tracking-grid">
            {filteredOrders.map((order) => {
              const form = trackingForms[order.order_id] || {};

              return (
                <div className="luxury-tracking-card" key={order.order_id}>
                  <div className="luxury-tracking-card-header">
                    <div>
                      <span className="luxury-eyebrow">ORDER</span>
                      <h4>#{order.order_id}</h4>
                      <p>{order.customer_name || "Unknown Customer"}</p>
                    </div>

                    <span className={getStatusClass(order.order_status)}>
                      {(order.order_status || "pending").replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="luxury-tracking-form">

                    <label>
                      Order Status
                      <select
                        value={form.order_status || "pending"}
                        onChange={(e) =>
                          updateForm(order.order_id, "order_status", e.target.value)
                        }
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span><Truck size={15} /> Courier Company</span>
                      <input
                        type="text"
                        placeholder="e.g. Delhivery, Blue Dart"
                        value={form.courier_name || ""}
                        onChange={(e) =>
                          updateForm(order.order_id, "courier_name", e.target.value)
                        }
                      />
                    </label>

                    <label>
                      <span><Package size={15} /> Tracking Number</span>
                      <input
                        type="text"
                        placeholder="Enter tracking / AWB number"
                        value={form.tracking_number || ""}
                        onChange={(e) =>
                          updateForm(order.order_id, "tracking_number", e.target.value)
                        }
                      />
                    </label>

                    <label>
                      <span><CalendarDays size={15} /> Estimated Delivery</span>
                      <input
                        type="date"
                        value={form.estimated_delivery || ""}
                        onChange={(e) =>
                          updateForm(order.order_id, "estimated_delivery", e.target.value)
                        }
                      />
                    </label>

                    <div className="luxury-tracking-current">
                      <MapPin size={16} />
                      <span>
                        Current tracking number:{" "}
                        <strong>{order.tracking_number || "Not added yet"}</strong>
                      </span>
                    </div>

                    <button
                      className="luxury-save-tracking"
                      onClick={() => saveTracking(order.order_id)}
                      disabled={savingTracking === order.order_id}
                    >
                      {savingTracking === order.order_id ? (
                        <RefreshCw size={16} className="luxury-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {savingTracking === order.order_id
                        ? "Saving..."
                        : "Save Tracking Details"}
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminOrders;
