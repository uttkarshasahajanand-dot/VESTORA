
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  RefreshCw,
  UserRound,
  ShoppingBag,
  Wallet,
  UserCheck,
  XCircle
} from "lucide-react";
import API from "../services/api";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await API.get("/admin/customers", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error("Customers error:", err);
      setError(
        err.response?.data?.message || "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return customers.filter((customer) =>
      (customer.name || "").toLowerCase().includes(searchText) ||
      (customer.email || "").toLowerCase().includes(searchText) ||
      String(customer.user_id).includes(searchText) ||
      (customer.phone || "").toLowerCase().includes(searchText)
    );
  }, [customers, search]);

  const totalOrders = customers.reduce(
    (total, customer) =>
      total + Number(customer.total_orders || 0),
    0
  );

  const totalSpent = customers.reduce(
    (total, customer) =>
      total + Number(customer.total_spent || 0),
    0
  );

  const averageSpent = customers.length
    ? totalSpent / customers.length
    : 0;

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "-";

  return (
    <div className="luxury-customers">

      {/* Page Header */}
      <div className="luxury-customers-header">
        <div>
          <span className="luxury-eyebrow">
            CUSTOMER RELATIONSHIPS
          </span>

          <h2>Customers Management</h2>

          <p>
            Understand your customers and their shopping activity.
          </p>
        </div>

        <button
          className="luxury-refresh-btn"
          onClick={fetchCustomers}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "luxury-customer-spin" : ""}
          />
          Refresh Customers
        </button>
      </div>

      {/* Customer Statistics */}
      <div className="luxury-customer-stats">

        <div className="luxury-customer-stat">
          <div className="luxury-customer-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Customers</span>
            <h3>{customers.length}</h3>
          </div>
        </div>

        <div className="luxury-customer-stat">
          <div className="luxury-customer-stat-icon orders-icon">
            <ShoppingBag size={21} />
          </div>

          <div>
            <span>Total Orders</span>
            <h3>{totalOrders}</h3>
          </div>
        </div>

        <div className="luxury-customer-stat">
          <div className="luxury-customer-stat-icon spending-icon">
            <Wallet size={21} />
          </div>

          <div>
            <span>Total Customer Spending</span>
            <h3>₹{formatAmount(totalSpent)}</h3>
          </div>
        </div>

        <div className="luxury-customer-stat">
          <div className="luxury-customer-stat-icon average-icon">
            <UserCheck size={21} />
          </div>

          <div>
            <span>Average Spend / Customer</span>
            <h3>₹{formatAmount(averageSpent)}</h3>
          </div>
        </div>

      </div>

      {/* Customer Table */}
      <div className="luxury-customers-panel">

        <div className="luxury-customers-panel-header">
          <div>
            <h3>Registered Customers</h3>
            <p>
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>

          <div className="luxury-customer-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search name, email, phone or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="luxury-customers-message">
            <RefreshCw
              size={25}
              className="luxury-customer-spin"
            />
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="luxury-customers-message luxury-customer-error">
            <XCircle size={30} />
            <p>{error}</p>

            <button onClick={fetchCustomers}>
              Try Again
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="luxury-customers-message">
            <Users size={40} />
            <h3>No Customers Found</h3>
            <p>
              {search
                ? "Try searching with another customer detail."
                : "Registered customers will appear here."}
            </p>
          </div>
        ) : (
          <div className="luxury-customers-table-wrapper">
            <table className="luxury-customers-table">

              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>CUSTOMER ID</th>
                  <th>EMAIL ADDRESS</th>
                  <th>PHONE</th>
                  <th>TOTAL ORDERS</th>
                  <th>TOTAL SPENT</th>
                  <th>REGISTERED DATE</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.user_id}>

                    <td>
                      <div className="luxury-customer-profile">
                        <div className="luxury-customer-avatar">
                          <UserRound size={18} />
                        </div>

                        <span>
                          {customer.name || "Unknown"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="luxury-customer-id">
                        #{customer.user_id}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-customer-email">
                        {customer.email || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-customer-phone">
                        {customer.phone || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-customer-orders">
                        {Number(customer.total_orders || 0)}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-customer-spent">
                        ₹{formatAmount(customer.total_spent)}
                      </span>
                    </td>

                    <td>
                      <span className="luxury-customer-date">
                        {formatDate(customer.created_at)}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default AdminCustomers;
