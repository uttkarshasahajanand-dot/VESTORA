
import { useState } from "react";
import {
  ShoppingBag,
  UserRound,
  LogOut,
  Menu,
  X,
  LayoutDashboard
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "MEN", path: "/category/men" },
    { name: "WOMEN", path: "/category/women" },
    { name: "SHOES", path: "/category/shoes" },
    { name: "ACCESSORIES", path: "/category/accessories" }
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged out successfully!");

    setMenuOpen(false);
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="luxury-header">

      {/* MOBILE MENU BUTTON */}
      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* LEFT NAVIGATION */}
      <nav className={`nav-left ${menuOpen ? "active" : ""}`}>

        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={closeMenu}
          >
            {link.name}
          </Link>
        ))}

        {/* MOBILE ACCOUNT LINKS */}
        <div className="mobile-account-links">

          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin" onClick={closeMenu}>
                  ADMIN PANEL
                </Link>
              ) : (
                <Link to="/my-orders" onClick={closeMenu}>
                  MY ORDERS
                </Link>
              )}

              <button onClick={handleLogout}>
                <LogOut size={16} />
                LOGOUT
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu}>
              LOGIN / REGISTER
            </Link>
          )}

        </div>
      </nav>

      {/* CENTER LOGO */}
      <div className="nav-logo">
        <Link to="/" onClick={closeMenu}>
          VESTORA
          <span>STYLE THAT DEFINES YOU</span>
        </Link>
      </div>

      {/* RIGHT NAVIGATION */}
      <div className="nav-right">

        {user ? (
          <>
            {!isAdmin && (
              <Link
                to="/my-orders"
                className="desktop-account-link"
              >
                MY ORDERS
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="desktop-account-link admin-link"
              >
                <LayoutDashboard size={17} />
                ADMIN PANEL
              </Link>
            )}

            <span className="navbar-user">
              HI, {user.name?.split(" ")[0]?.toUpperCase()}
            </span>

            <button
              className="navbar-icon logout-button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={19} />
            </button>

          </>
        ) : (
          <Link
            to="/login"
            className="navbar-icon"
            aria-label="Login"
            title="Login"
          >
            <UserRound size={21} />
          </Link>
        )}

        {/* SHOPPING BAG - CUSTOMER ONLY */}
        {!isAdmin && (
          <Link
            to="/cart"
            className="navbar-cart"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={21} />
            <span className="cart-count">
              {totalItems || 0}
            </span>
          </Link>
        )}

      </div>

    </header>
  );
}

export default Navbar;
