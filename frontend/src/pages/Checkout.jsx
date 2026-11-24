
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Lock
} from "lucide-react";

import { useCart } from "../context/CartContext";
import API from "../services/api";

function Checkout() {
  const { cart, totalItems } = useCart();
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [formData, setFormData] = useState({
    full_name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPrice = (item) =>
    Number(item.discount_price || item.price || 0);

  const subtotal = cart.reduce(
    (total, item) =>
      total + getPrice(item) * item.quantity,
    0
  );

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const invalidItem = cart.find(
      (item) => !item.variant_id
    );

    if (invalidItem) {
      setError(
        `Please remove ${invalidItem.product_name} and add it again after selecting a size and colour.`
      );
      return;
    }

    setLoading(true);

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("vestora_token");

      if (!token) {
        setError("Please log in before placing your order.");
        navigate("/login");
        return;
      }

      const orderData = {
        ...formData,
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity
        }))
      };

      const response = await API.post(
        "/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert(
          `Order placed successfully! Your Order ID is ${response.data.order_id}`
        );

        localStorage.removeItem("vestora_cart");

        navigate("/my-orders");
        window.location.reload();
      } else {
        setError(
          response.data.message || "Unable to place your order."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="luxury-checkout-empty">
        <ShoppingBag size={50} strokeWidth={1.2} />

        <h2>Your shopping bag is empty</h2>

        <p>Add your favourite pieces before checkout.</p>

        <Link to="/" className="checkout-back-button">
          CONTINUE SHOPPING
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="luxury-checkout-page">

      <section className="checkout-hero">
        <p>VESTORA — THE FINAL STEP</p>

        <h1>Secure Checkout</h1>

        <span>
          Complete your details and get ready to experience VESTORA.
        </span>

        <div className="checkout-steps">
          <span className="checkout-step completed">
            01. SHOPPING BAG
          </span>

          <span className="checkout-step active">
            02. CHECKOUT
          </span>

          <span className="checkout-step">
            03. CONFIRMATION
          </span>
        </div>
      </section>

      <section className="luxury-checkout-container">

        <div className="luxury-checkout-form">

          <div className="checkout-section-heading">
            <div className="checkout-heading-icon">
              <MapPin size={22} />
            </div>

            <div>
              <p>STEP 01</p>
              <h2>Delivery Information</h2>
            </div>
          </div>

          <p className="checkout-form-description">
            Enter your details so we can deliver your
            selected pieces safely to your doorstep.
          </p>

          {error && (
            <div className="luxury-checkout-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="checkout-input-group">
              <label>FULL NAME</label>

              <input
                type="text"
                name="full_name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-input-group">
              <label>EMAIL ADDRESS</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-input-group">
              <label>PHONE NUMBER</label>

              <input
                type="tel"
                name="phone"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                title="Enter a 10-digit phone number"
                maxLength={10}
                required
              />
            </div>

            <div className="checkout-input-group">
              <label>FULL DELIVERY ADDRESS</label>

              <textarea
                name="address_line"
                placeholder="House number, street, area and landmark"
                value={formData.address_line}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="checkout-two-column">

              <div className="checkout-input-group">
                <label>CITY</label>

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-input-group">
                <label>STATE</label>

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="checkout-input-group">
              <label>PIN CODE</label>

              <input
                type="text"
                name="pincode"
                placeholder="6-digit PIN code"
                value={formData.pincode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                maxLength={6}
                title="Enter a 6-digit PIN code"
                required
              />
            </div>

            <div className="checkout-delivery-note">
              <Truck size={21} />

              <div>
                <strong>Complimentary Shipping</strong>
                <p>
                  Free delivery on orders above ₹999.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="luxury-place-order-button"
              disabled={loading}
            >
              {loading ? (
                "PLACING YOUR ORDER..."
              ) : (
                <>
                  PLACE YOUR ORDER
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </form>

        </div>

        <aside className="luxury-checkout-summary">

          <p className="checkout-summary-eyebrow">
            YOUR SELECTION
          </p>

          <h2>Order Summary</h2>

          <p className="checkout-item-count">
            {totalItems} ITEMS IN YOUR BAG
          </p>

          <div className="checkout-summary-products">

            {cart.map((item) => {
              const image =
                item.images?.find(
                  (img) =>
                    img.is_primary === 1 ||
                    img.is_primary === true
                )?.image_url ||
                item.images?.[0]?.image_url;

              return (
                <div
                  className="luxury-checkout-product"
                  key={`${item.product_id}-${item.variant_id}`}
                >

                  <div className="checkout-product-image">
                    {image ? (
                      <img
                        src={image}
                        alt={item.product_name}
                      />
                    ) : (
                      <div>VESTORA</div>
                    )}

                    <span>{item.quantity}</span>
                  </div>

                  <div className="checkout-product-info">
                    <h3>{item.product_name}</h3>

                    <p>
                      {item.brand || "VESTORA"}
                    </p>

                    <p>
                      Size: {item.size || "N/A"}
                    </p>

                    <p>
                      Colour: {item.color || "N/A"}
                    </p>

                    <strong>
                      {formatPrice(
                        getPrice(item) * item.quantity
                      )}
                    </strong>
                  </div>

                </div>
              );
            })}

          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-price-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="checkout-price-row">
            <span>Shipping</span>

            <span>
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </span>
          </div>

          <div className="checkout-free-shipping">
            {subtotal >= 999
              ? "You have unlocked complimentary shipping."
              : `Add ${formatPrice(999 - subtotal)} more to unlock free shipping.`}
          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-final-total">
            <span>Grand Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <p className="checkout-tax-note">
            Final amount payable for your order.
          </p>

          <div className="checkout-security">
            <ShieldCheck size={21} />

            <div>
              <strong>Secure Checkout</strong>
              <p>Your order details are protected.</p>
            </div>
          </div>

          <div className="checkout-security">
            <Lock size={20} />

            <div>
              <strong>Safe Shopping</strong>
              <p>Shop with confidence at VESTORA.</p>
            </div>
          </div>

        </aside>

      </section>

    </div>
  );
}

export default Checkout;
