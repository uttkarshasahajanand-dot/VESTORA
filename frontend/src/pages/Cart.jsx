
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingCart
} from "lucide-react";

import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    removeFromCart,
    updateQuantity
  } = useCart();

  const getPrice = (product) =>
    Number(product.discount_price || product.price || 0);

  const subtotal = cart.reduce(
    (total, item) =>
      total + getPrice(item) * item.quantity,
    0
  );

  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const handleCheckout = () => {
    const invalidItem = cart.find(
      (item) => !item.variant_id
    );

    if (invalidItem) {
      alert(
        `Please remove ${invalidItem.product_name} and add it again by selecting a size and colour.`
      );
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="luxury-cart-page">

      <section className="cart-page-heading">
        <p>YOUR VESTORA EXPERIENCE</p>

        <h1>Shopping Bag</h1>

        <span>
          Review your selections before completing your order.
        </span>
      </section>

      {cart.length === 0 ? (

        <section className="empty-cart">

          <div className="empty-cart-icon">
            <ShoppingBag size={45} strokeWidth={1.2} />
          </div>

          <p className="cart-eyebrow">
            YOUR BAG IS WAITING
          </p>

          <h2>Your shopping bag is empty.</h2>

          <p>
            Discover timeless styles and find something
            that defines you.
          </p>

          <Link to="/" className="cart-shop-button">
            CONTINUE SHOPPING
            <ArrowRight size={18} />
          </Link>

        </section>

      ) : (

        <section className="luxury-cart-content">

          <div className="cart-items-section">

            <div className="cart-items-heading">
              <h2>Your Selection</h2>

              <span>
                {cart.length} {cart.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            {cart.map((item) => {
              const image =
                item.images?.find(
                  (img) =>
                    img.is_primary === 1 ||
                    img.is_primary === true
                )?.image_url ||
                item.images?.[0]?.image_url;

              const price = getPrice(item);

              return (
                <div
                  className="luxury-cart-item"
                  key={`${item.product_id}-${item.variant_id}`}
                >

                  <div className="cart-product-image">
                    {image ? (
                      <img
                        src={image}
                        alt={item.product_name}
                      />
                    ) : (
                      <div className="cart-no-image">
                        NO IMAGE
                      </div>
                    )}
                  </div>

                  <div className="cart-product-details">

                    <p className="cart-product-brand">
                      {item.brand || "VESTORA"}
                    </p>

                    <h3>{item.product_name}</h3>

                    <p className="cart-product-category">
                      {item.category_name}
                    </p>

                    <p className="cart-product-price">
                      {formatPrice(price)}
                    </p>

                    <div className="cart-variant-details">
                      <span>
                        Size: <strong>{item.size || "N/A"}</strong>
                      </span>

                      <span>
                        Colour: <strong>{item.color || "N/A"}</strong>
                      </span>
                    </div>

                    <div className="cart-quantity-control">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            item.variant_id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            item.variant_id,
                            item.quantity + 1
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>

                    </div>

                  </div>

                  <div className="cart-item-actions">

                    <p>
                      {formatPrice(price * item.quantity)}
                    </p>

                    <button
                      className="cart-remove-button"
                      onClick={() =>
                        removeFromCart(
                          item.product_id,
                          item.variant_id
                        )
                      }
                      aria-label={`Remove ${item.product_name}`}
                    >
                      <Trash2 size={18} />
                      REMOVE
                    </button>

                  </div>

                </div>
              );
            })}

            <Link to="/" className="cart-continue-link">
              <ArrowRight size={16} />
              CONTINUE SHOPPING
            </Link>

          </div>

          <aside className="luxury-order-summary">

            <p className="cart-eyebrow">
              ORDER DETAILS
            </p>

            <h2>Order Summary</h2>

            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-line">
              <span>Shipping</span>

              <span>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>

            <div className="summary-shipping-note">
              {subtotal >= 999
                ? "You qualify for complimentary shipping."
                : `Add ${formatPrice(999 - subtotal)} more for free shipping.`}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <p className="summary-tax-note">
              Taxes are included where applicable.
            </p>

            <button
              className="cart-checkout-button"
              onClick={handleCheckout}
            >
              PROCEED TO CHECKOUT
              <ArrowRight size={18} />
            </button>

            <div className="cart-secure-note">
              <ShoppingCart size={17} />
              SECURE SHOPPING EXPERIENCE
            </div>

          </aside>

        </section>

      )}

    </div>
  );
}

export default Cart;
