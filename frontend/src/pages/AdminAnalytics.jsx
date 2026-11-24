
import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Package,
  RefreshCw,
  ChartNoAxesCombined,
  Trophy,
  CheckCircle2
} from "lucide-react";
import API from "../services/api";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    monthlySales: [],
    ordersByStatus: [],
    topProducts: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await API.get("/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data.analytics || {};

      setAnalytics({
        monthlySales: data.monthlySales || [],
        ordersByStatus: data.ordersByStatus || [],
        topProducts: data.topProducts || []
      });
    } catch (err) {
      console.error("Analytics error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  const monthlySales = analytics.monthlySales;
  const ordersByStatus = analytics.ordersByStatus;
  const topProducts = analytics.topProducts;

  const maxRevenue = Math.max(
    1,
    ...monthlySales.map((item) => Number(item.revenue || 0))
  );

  const totalRevenue = monthlySales.reduce(
    (total, item) => total + Number(item.revenue || 0),
    0
  );

  const totalOrders = ordersByStatus.reduce(
    (total, item) => total + Number(item.total || 0),
    0
  );

  const totalProductsSold = topProducts.reduce(
    (total, item) => total + Number(item.total_sold || 0),
    0
  );

  const statusColors = {
    pending: "pending",
    confirmed: "confirmed",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled"
  };

  if (loading) {
    return (
      <div className="luxury-analytics-loading">
        <RefreshCw size={28} className="luxury-analytics-spin" />
        <p>Preparing your store analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="luxury-analytics-error">
        <ChartNoAxesCombined size={35} />
        <h3>Analytics Unavailable</h3>
        <p>{error}</p>
        <button onClick={fetchAnalytics}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="luxury-analytics">

      {/* Header */}
      <div className="luxury-analytics-header">
        <div>
          <span className="luxury-eyebrow">
            BUSINESS INTELLIGENCE
          </span>

          <h2>Store Analytics</h2>

          <p>
            Discover sales trends and understand your store performance.
          </p>
        </div>

        <button
          className="luxury-refresh-btn"
          onClick={fetchAnalytics}
        >
          <RefreshCw size={16} />
          Refresh Analytics
        </button>
      </div>

      {/* Summary Cards */}
      <div className="luxury-analytics-stats">

        <div className="luxury-analytics-stat">
          <div className="luxury-analytics-stat-icon">
            <IndianRupee size={22} />
          </div>

          <div>
            <span>Revenue · Last 6 Months</span>
            <h3>{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="luxury-analytics-stat">
          <div className="luxury-analytics-stat-icon orders">
            <ShoppingCart size={22} />
          </div>

          <div>
            <span>Orders by Status</span>
            <h3>{totalOrders}</h3>
          </div>
        </div>

        <div className="luxury-analytics-stat">
          <div className="luxury-analytics-stat-icon products">
            <Package size={22} />
          </div>

          <div>
            <span>Units Sold · Top Products</span>
            <h3>{totalProductsSold}</h3>
          </div>
        </div>

        <div className="luxury-analytics-stat">
          <div className="luxury-analytics-stat-icon performance">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Products Ranked</span>
            <h3>{topProducts.length}</h3>
          </div>
        </div>

      </div>

      {/* Main Analytics Grid */}
      <div className="luxury-analytics-grid">

        {/* Monthly Sales */}
        <div className="luxury-analytics-card luxury-sales-card">

          <div className="luxury-analytics-card-heading">
            <div>
              <span className="luxury-analytics-label">
                REVENUE OVERVIEW
              </span>
              <h3>Monthly Sales</h3>
              <p>Revenue over the last six months</p>
            </div>

            <div className="luxury-chart-icon">
              <TrendingUp size={21} />
            </div>
          </div>

          {monthlySales.length === 0 ? (
            <div className="luxury-analytics-empty">
              No sales data available.
            </div>
          ) : (
            <>
              <div className="luxury-sales-total">
                <span>Total Revenue</span>
                <strong>{formatCurrency(totalRevenue)}</strong>
              </div>

              <div className="luxury-sales-chart">
                {monthlySales.map((item, index) => {
                  const revenue = Number(item.revenue || 0);
                  const barHeight = Math.max(
                    5,
                    (revenue / maxRevenue) * 100
                  );

                  return (
                    <div
                      className="luxury-sales-bar-item"
                      key={`${item.month}-${index}`}
                    >
                      <span className="luxury-sales-bar-value">
                        {formatCurrency(revenue)}
                      </span>

                      <div className="luxury-sales-bar-track">
                        <div
                          className="luxury-sales-bar-fill"
                          style={{
                            height: `${barHeight}%`
                          }}
                        />
                      </div>

                      <span className="luxury-sales-month">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>

        {/* Orders by Status */}
        <div className="luxury-analytics-card">

          <div className="luxury-analytics-card-heading">
            <div>
              <span className="luxury-analytics-label">
                ORDER OVERVIEW
              </span>
              <h3>Orders by Status</h3>
              <p>Distribution of customer orders</p>
            </div>

            <div className="luxury-chart-icon">
              <ShoppingCart size={21} />
            </div>
          </div>

          {ordersByStatus.length === 0 ? (
            <div className="luxury-analytics-empty">
              No order data available.
            </div>
          ) : (
            <div className="luxury-status-list">
              {ordersByStatus.map((item) => {
                const status = String(
                  item.order_status || "pending"
                ).toLowerCase();

                const percentage = totalOrders
                  ? (Number(item.total || 0) / totalOrders) * 100
                  : 0;

                return (
                  <div
                    className="luxury-status-item"
                    key={status}
                  >
                    <div className="luxury-status-item-top">
                      <div className="luxury-status-name">
                        <span
                          className={`luxury-status-dot ${statusColors[status] || "pending"}`}
                        />
                        <span>{status}</span>
                      </div>

                      <strong>{item.total}</strong>
                    </div>

                    <div className="luxury-status-track">
                      <div
                        className={`luxury-status-fill ${statusColors[status] || "pending"}`}
                        style={{
                          width: `${percentage}%`
                        }}
                      />
                    </div>

                    <span className="luxury-status-percentage">
                      {percentage.toFixed(1)}% of orders
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Top Selling Products */}
        <div className="luxury-analytics-card luxury-top-products-card">

          <div className="luxury-analytics-card-heading">
            <div>
              <span className="luxury-analytics-label">
                PRODUCT PERFORMANCE
              </span>
              <h3>Top Selling Products</h3>
              <p>Your best-performing products</p>
            </div>

            <div className="luxury-chart-icon">
              <Trophy size={21} />
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="luxury-analytics-empty">
              No product sales available.
            </div>
          ) : (
            <div className="luxury-top-products-list">
              {topProducts.map((item, index) => (
                <div
                  className="luxury-top-product"
                  key={`${item.product_name}-${index}`}
                >
                  <div className="luxury-product-rank">
                    {index + 1}
                  </div>

                  <div className="luxury-top-product-info">
                    <h4>{item.product_name}</h4>
                    <span>
                      {item.total_sold} units sold
                    </span>
                  </div>

                  <div className="luxury-top-product-revenue">
                    <strong>
                      {formatCurrency(item.total_revenue)}
                    </strong>
                    <small>Revenue</small>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Bottom Note */}
      <div className="luxury-analytics-note">
        <CheckCircle2 size={18} />
        <p>
          Analytics are based on the data returned by your store's backend.
        </p>
      </div>

    </div>
  );
}

export default AdminAnalytics;
