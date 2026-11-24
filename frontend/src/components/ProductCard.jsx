
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const totalStock = Number(product.total_stock || 0);
  const isOutOfStock = totalStock <= 0;

  const image =
    product.images?.find(
      (img) => img.is_primary === 1 || img.is_primary === true
    )?.image_url ||
    product.images?.[0]?.image_url;

  const handleAddToCart = () => {
    if (isAdmin || isOutOfStock) return;

    addToCart(product);
    alert("Product added to cart!");
  };

  return (
    <div className={`product-card ${isOutOfStock ? "out-of-stock-card" : ""}`}>
      <div className="product-image">
        {image ? (
          <img src={image} alt={product.product_name} />
        ) : (
          <div className="no-image">No Image Available</div>
        )}

        {isOutOfStock && (
          <span className="out-of-stock-label">
            OUT OF STOCK
          </span>
        )}
      </div>

      <div className="product-info">
        <p className="product-brand">
          {product.brand || "VESTORA"}
        </p>

        <h3>{product.product_name}</h3>

        <p>{product.category_name}</p>

        <div className="product-price">
          {product.discount_price ? (
            <>
              <span>
                ₹{Number(product.discount_price).toLocaleString("en-IN")}
              </span>
              <del>
                ₹{Number(product.price).toLocaleString("en-IN")}
              </del>
            </>
          ) : (
            <span>
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {!isAdmin && !isOutOfStock && (
          <button
            className="add-to-cart"
            onClick={handleAddToCart}
          >
            ADD TO CART
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
