
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChartNoAxesCombined,
  LogOut,
  Menu,
  X,
  Store,
  IndianRupee,
  RefreshCw,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CalendarDays
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminCustomers from "./AdminCustomers";
import AdminAnalytics from "./AdminAnalytics";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Products", icon: Package },
    { name: "Orders", icon: ShoppingCart },
    { name: "Customers", icon: Users },
    { name: "Analytics", icon: ChartNoAxesCombined }
  ];

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const [statsResponse, ordersResponse] = await Promise.all([
        API.get("/admin/dashboard", config),
        API.get("/admin/orders", config)
      ]);

      setStats(statsResponse.data.stats || {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0
      });

      setRecentOrders(
        (ordersResponse.data.orders || []).slice(0, 5)
      );

    } catch (err) {
      console.error("Dashboard error:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openPage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const renderDashboard = () => (
    <div className="luxury-admin-dashboard">

      {/* WELCOME SECTION */}

      <section className="luxury-admin-welcome">
        <div>
          <span className="admin-eyebrow">
            STORE OVERVIEW
          </span>

          <h2>
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}.
          </h2>

          <p>
            Here's an overview of your VESTORA business.
          </p>
        </div>

        <button
          className="luxury-admin-refresh"
          onClick={fetchDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "admin-spinning" : ""}
          />
          Refresh Data
        </button>
      </section>

      {error && (
        <div className="luxury-admin-error">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <section className="luxury-admin-stats">

        <div className="luxury-stat-card">
          <div className="luxury-stat-top">
            <span>TOTAL PRODUCTS</span>
            <div className="luxury-stat-icon">
              <Package size={21} />
            </div>
          </div>

          <h3>{loading ? "..." : stats.totalProducts ?? 0}</h3>

          <p>Products in your store</p>
        </div>

        <div className="luxury-stat-card">
          <div className="luxury-stat-top">
            <span>TOTAL ORDERS</span>
            <div className="luxury-stat-icon">
              <ShoppingCart size={21} />
            </div>
          </div>

          <h3>{loading ? "..." : stats.totalOrders ?? 0}</h3>

          <p>Customer purchases</p>
        </div>

        <div className="luxury-stat-card">
          <div className="luxury-stat-top">
            <span>TOTAL CUSTOMERS</span>
            <div className="luxury-stat-icon">
              <Users size={21} />
            </div>
          </div>

          <h3>{loading ? "..." : stats.totalCustomers ?? 0}</h3>

          <p>Registered customers</p>
        </div>

        <div className="luxury-stat-card revenue-stat">
          <div className="luxury-stat-top">
            <span>TOTAL REVENUE</span>
            <div className="luxury-stat-icon">
              <IndianRupee size={21} />
            </div>
          </div>

          <h3>
            {loading ? "..." : formatCurrency(stats.totalRevenue)}
          </h3>

          <p>Store revenue</p>
        </div>

      </section>

      {/* RECENT ORDERS */}

      <section className="luxury-admin-orders">

        <div className="luxury-admin-section-heading">

          <div>
            <span className="admin-eyebrow">
              ORDER MANAGEMENT
            </span>

            <h2>Recent Orders</h2>

            <p>Keep track of your latest customer purchases.</p>
          </div>

          <button
            className="luxury-view-all"
            onClick={() => openPage("Orders")}
          >
            VIEW ALL
            <ArrowUpRight size={17} />
          </button>

        </div>

        {loading ? (
          <div className="luxury-admin-message">
            <RefreshCw size={20} className="admin-spinning" />
            Loading recent orders...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="luxury-admin-message">
            <ShoppingCart size={30} />
            <p>No orders available yet.</p>
          </div>
        ) : (
          <div className="luxury-admin-table-wrapper">

            <table className="luxury-admin-table">

              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ORDER DATE</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.order_id}>

                    <td>
                      <strong>#{order.order_id}</strong>
                    </td>

                    <td>
                      {order.customer_name || "Unknown"}
                    </td>

                    <td className="admin-amount">
                      {formatCurrency(order.total_amount)}
                    </td>

                    <td>
                      <span
                        className={`luxury-order-badge ${String(
                          order.order_status || "pending"
                        ).toLowerCase()}`}
                      >
                        {order.order_status || "pending"}
                      </span>
                    </td>

                    <td>
                      {formatDate(order.created_at)}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* PERFORMANCE CARD */}

      <section className="luxury-admin-performance">

        <div className="performance-icon">
          <TrendingUp size={25} />
        </div>

        <div>
          <span>VESTORA BUSINESS INSIGHTS</span>
          <h3>Everything under control.</h3>
          <p>
            Manage your collections, track customer purchases
            and monitor your store performance from one place.
          </p>
        </div>

      </section>

    </div>
  );

  return (
    <div className="luxury-admin-layout">

      {/* MOBILE HEADER */}

      <div className="luxury-admin-mobile-header">

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle admin menu"
        >
          {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <h2>VESTORA</h2>

        <span>ADMIN</span>

      </div>

      {/* SIDEBAR */}

      <aside
        className={`luxury-admin-sidebar ${
          sidebarOpen ? "active" : ""
        }`}
      >

        <div className="luxury-admin-brand">

          <div className="admin-brand-icon">
            <Store size={24} />
          </div>

          <div>
            <h2>VESTORA</h2>
            <span>ADMINISTRATION</span>
          </div>

        </div>

        <div className="luxury-admin-sidebar-label">
          MAIN MENU
        </div>

        <nav className="luxury-admin-nav">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`luxury-admin-nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => openPage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>

                {activePage === item.name && (
                  <span className="admin-active-indicator"></span>
                )}
              </button>
            );
          })}

        </nav>

        <div className="luxury-admin-sidebar-bottom">

          <div className="admin-profile">

            <div className="admin-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <strong>{user?.name || "Administrator"}</strong>
              <span>Store Administrator</span>
            </div>

          </div>

          <button
            className="luxury-admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="luxury-admin-main">

        <header className="luxury-admin-header">

          <div>
            <span>VESTORA / ADMINISTRATION</span>
            <h1>{activePage}</h1>
          </div>

          <div className="admin-header-right">

            <div className="admin-header-date">
              <CalendarDays size={17} />
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </div>

            <div className="admin-header-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

          </div>

        </header>

        <div className="luxury-admin-content">

          {activePage === "Dashboard" && renderDashboard()}

          {activePage === "Products" && <AdminProducts />}

          {activePage === "Orders" && <AdminOrders />}

          {activePage === "Customers" && <AdminCustomers />}

          {activePage === "Analytics" && <AdminAnalytics />}

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;
