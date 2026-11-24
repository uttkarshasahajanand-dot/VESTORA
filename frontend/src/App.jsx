
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import CategoryPage from "./pages/CategoryPage";

import { CartProvider } from "./context/CartContext";

import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app">

          <div className="announcement">
            FREE SHIPPING ON ORDERS ABOVE ₹999
          </div>

          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/category/:categoryName"
              element={<CategoryPage />}
            />

            <Route path="/cart" element={<Cart />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="*"
              element={
                <div className="not-found">
                  <h2>PAGE NOT FOUND</h2>
                  <a href="/">BACK TO HOME</a>
                </div>
              }
            />
          </Routes>

          <Footer />

        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
