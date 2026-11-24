
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  MapPin,
  CalendarDays,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Navigation,
  ClipboardList
} from "lucide-react";
import API from "../services/api";

const TRACKING_STEPS = [
  { status: "pending", label: "Order Placed", description: "Your order has been received.", icon: ShoppingBag },
  { status: "confirmed", label: "Order Confirmed", description: "Your order has been confirmed.", icon: CheckCircle2 },
  { status: "processing", label: "Processing", description: "Your order is being prepared.", icon: Package },
  { status: "packed", label: "Packed", description: "Your order is packed and ready.", icon: Package },
  { status: "shipped", label: "Shipped", description: "Your order is on its way.", icon: Truck },
  { status: "out_for_delivery", label: "Out for Delivery", description: "Your order is arriving soon.", icon: Navigation },
  { status: "delivered", label: "Delivered", description: "Your order has been delivered.", icon: CheckCircle2 }
];

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const [trackingLoading, setTrackingLoading] = useState(null);
  const [trackingErrors, setTrackingErrors] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get("/my-orders");

        if (response.data.success) {
          setOrders(response.data.orders || []);
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchTracking = async (orderId) => {
    try {
      setTrackingLoading(orderId);

      setTrackingErrors((previous) => ({
        ...previous,
        [orderId]: ""
      }));

      const response = await API.get(
        `/orders/${orderId}/tracking`
      );

      if (response.data.success) {
        setTrackingData((previous) => ({
          ...previous,
          [orderId]: response.data
        }));
      }
    } catch (error) {
      setTrackingErrors((previous) => ({
        ...previous,
        [orderId]:
          error.response?.data?.message ||
          "Unable to load tracking information."
      }));
    } finally {
      setTrackingLoading(null);
    }
  };

  const toggleTracking = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    if (!trackingData[orderId]) {
      fetchTracking(orderId);
    }
  };

  const formatStatus = (status) =>
    status?.replace(/_/g, " ").toUpperCase() || "PENDING";

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      : "Not available";

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle2 size={15} />;
      case "shipped":
      case "out_for_delivery":
        return <Truck size={15} />;
      case "cancelled":
      case "returned":
        return <XCircle size={15} />;
      case "confirmed":
      case "packed":
        return <Package size={15} />;
      default:
        return <Clock size={15} />;
    }
  };

  if (loading) {
    return (
      <div className="luxury-orders-loading">
        <RefreshCw size={30} className="loading-icon" />
        <p>LOADING YOUR ORDERS</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="luxury-orders-empty">
        <XCircle size={45} />
        <h2>Something Went Wrong</h2>
        <p>{error}</p>
        <button
          className="luxury-order-button"
          onClick={() => window.location.reload()}
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="luxury-orders-page">

      <section className="orders-hero">
        <span>YOUR VESTORA ACCOUNT</span>
        <h1>My Orders</h1>
        <p>
          Every purchase tells a story. View and track your orders here.
        </p>
      </section>

      <div className="orders-container">

        <div className="orders-section-heading">
          <div>
            <span>ORDER HISTORY</span>
            <h2>Your Purchases</h2>
          </div>

          <div className="orders-count">
            {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="luxury-orders-empty">
            <div className="empty-order-icon">
              <ShoppingBag size={38} />
            </div>

            <span>YOUR COLLECTION AWAITS</span>
            <h2>No Orders Yet</h2>

            <p>
              You haven't placed an order yet.
              Discover our latest collections and find something you love.
            </p>

            <Link to="/" className="luxury-order-button">
              EXPLORE COLLECTION
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="luxury-orders-list">

            {orders.map((order) => {
              const tracking = trackingData[order.order_id];
              const trackingOrder = tracking?.order;
              const trackingInfo = tracking?.tracking;
              const status = trackingOrder?.order_status || order.order_status;
              const isExpanded = expandedOrder === order.order_id;

              return (
                <article className="luxury-order-card" key={order.order_id}>

                  <div className="luxury-order-header">

                    <div className="order-number">
                      <span>ORDER NUMBER</span>
                      <h3>#{order.order_id}</h3>
                    </div>

                    <div className="order-date">
                      <CalendarDays size={16} />
                      <div>
                        <span>ORDER DATE</span>
                        <p>{formatDate(order.created_at)}</p>
                      </div>
                    </div>

                    <div
                      className={`luxury-order-status ${status?.toLowerCase()}`}
                    >
                      {getStatusIcon(status)}
                      {formatStatus(status)}
                    </div>

                  </div>

                  <div className="luxury-order-products">

                    {order.items?.map((item) => (
                      <div
                        className="luxury-order-product"
                        key={item.order_item_id}
                      >
                        <div className="order-product-details">
                          <h4>{item.product_name}</h4>

                          <div className="order-product-meta">
                            {item.size && <span>SIZE: {item.size}</span>}
                            {item.color && <span>COLOR: {item.color}</span>}
                            <span>QTY: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="order-product-price">
                          ₹{(
                            Number(item.price) * Number(item.quantity)
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
                    ))}

                  </div>

                  <div className="luxury-order-address">

                    <div className="address-heading">
                      <MapPin size={17} />
                      <h4>DELIVERY ADDRESS</h4>
                    </div>

                    <div className="address-details">
                      <strong>{order.full_name}</strong>
                      <p>{order.phone}</p>
                      <p>{order.address_line}</p>
                      <p>
                        {order.city}, {order.state} - {order.pincode}
                      </p>
                    </div>

                  </div>

                  <div className="luxury-order-footer">
                    <span>TOTAL ORDER VALUE</span>

                    <strong>
                      ₹{Number(order.total_amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </strong>
                  </div>

                  <button
                    className="luxury-track-order-btn"
                    onClick={() => toggleTracking(order.order_id)}
                  >
                    <Truck size={18} />
                    {isExpanded ? "HIDE TRACKING" : "TRACK YOUR ORDER"}
                    {isExpanded
                      ? <ChevronUp size={17} />
                      : <ChevronDown size={17} />}
                  </button>

                  {isExpanded && (
                    <div className="luxury-tracking-details">

                      {trackingLoading === order.order_id ? (
                        <div className="luxury-tracking-loading">
                          <RefreshCw size={23} className="loading-icon" />
                          <p>FETCHING YOUR TRACKING DETAILS...</p>
                        </div>
                      ) : trackingErrors[order.order_id] ? (
                        <div className="luxury-tracking-error">
                          <XCircle size={22} />
                          <p>{trackingErrors[order.order_id]}</p>
                          <button onClick={() => fetchTracking(order.order_id)}>
                            TRY AGAIN
                          </button>
                        </div>
                      ) : tracking ? (
                        <>
                          <div className="luxury-tracking-title">
                            <span>YOUR DELIVERY JOURNEY</span>
                            <h3>Order Tracking</h3>
                          </div>

                          {trackingInfo?.is_cancelled ? (
                            <div className="luxury-tracking-notice cancelled-notice">
                              <XCircle size={23} />
                              <div>
                                <strong>Order Cancelled</strong>
                                <p>This order has been cancelled.</p>
                              </div>
                            </div>
                          ) : trackingInfo?.is_returned ? (
                            <div className="luxury-tracking-notice returned-notice">
                              <RefreshCw size={23} />
                              <div>
                                <strong>Order Returned</strong>
                                <p>This order has been marked as returned.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="luxury-tracking-timeline">
                              {TRACKING_STEPS.map((step, index) => {
                                const completed =
                                  index <= (trackingInfo?.current_step ?? -1);

                                const StepIcon = step.icon;

                                return (
                                  <div
                                    className={`luxury-timeline-step ${completed ? "completed" : ""}`}
                                    key={step.status}
                                  >
                                    <div className="luxury-timeline-marker">
                                      <StepIcon size={17} />
                                    </div>

                                    <div className="luxury-timeline-content">
                                      <h4>{step.label}</h4>
                                      <p>{step.description}</p>
                                    </div>

                                    {completed && (
                                      <span className="timeline-completed-label">
                                        COMPLETED
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="luxury-shipment-information">
                            <div className="luxury-tracking-title">
                              <span>SHIPMENT INFORMATION</span>
                              <h3>Delivery Details</h3>
                            </div>

                            <div className="luxury-shipment-grid">

                              <div>
                                <Truck size={18} />
                                <span>COURIER COMPANY</span>
                                <strong>
                                  {trackingOrder?.courier_name || "Not assigned yet"}
                                </strong>
                              </div>

                              <div>
                                <ClipboardList size={18} />
                                <span>TRACKING NUMBER</span>
                                <strong>
                                  {trackingOrder?.tracking_number || "Not available yet"}
                                </strong>
                              </div>

                              <div>
                                <CalendarDays size={18} />
                                <span>ESTIMATED DELIVERY</span>
                                <strong>
                                  {formatDate(trackingOrder?.estimated_delivery)}
                                </strong>
                              </div>

                              <div>
                                <CheckCircle2 size={18} />
                                <span>DELIVERY STATUS</span>
                                <strong>{formatStatus(status)}</strong>
                              </div>

                              {trackingOrder?.shipped_at && (
                                <div>
                                  <Truck size={18} />
                                  <span>SHIPPED ON</span>
                                  <strong>{formatDate(trackingOrder.shipped_at)}</strong>
                                </div>
                              )}

                              {trackingOrder?.delivered_at && (
                                <div>
                                  <CheckCircle2 size={18} />
                                  <span>DELIVERED ON</span>
                                  <strong>{formatDate(trackingOrder.delivered_at)}</strong>
                                </div>
                              )}

                            </div>
                          </div>

                          <p className="luxury-tracking-footer-note">
                            <Package size={15} />
                            Thank you for shopping with VESTORA.
                          </p>
                        </>
                      ) : null}

                    </div>
                  )}

                </article>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyOrders;
