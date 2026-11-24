
import { Link } from "react-router-dom";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="footer">
      <div className="footer-main">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            VESTORA<span>.</span>
          </Link>

          <p className="footer-tagline">
            STYLE THAT DEFINES YOU.
          </p>

          <p className="footer-description">
            Discover timeless fashion, refined essentials,
            and styles that express your individuality.
          </p>

          <div className="footer-socials">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              INSTAGRAM ↗
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>EXPLORE</h3>
          <Link to="/">Home</Link>
          <Link to="/men">Men</Link>
          <Link to="/women">Women</Link>
          <Link to="/collections">Collections</Link>
        </div>

        <div className="footer-column">
          <h3>YOUR ACCOUNT</h3>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/cart">Shopping Bag</Link>
          <Link to="/my-orders">My Orders</Link>
        </div>

        <div className="footer-column footer-contact">
          <h3>THE VESTORA PROMISE</h3>
          <p>Timeless style. Thoughtful details.</p>
          <p>Designed to make every moment stylish.</p>

          <button onClick={scrollToTop} className="back-to-top">
            BACK TO TOP ↑
          </button>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 VESTORA. ALL RIGHTS RESERVED.</p>

        <p className="footer-bottom-text">
          MADE FOR YOUR EVERYDAY ELEGANCE
        </p>

        <Link to="/" className="footer-bottom-link">
          DISCOVER MORE ↗
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
