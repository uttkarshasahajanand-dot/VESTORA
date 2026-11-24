
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function ProductCard({ product }) {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "admin";

  const totalStock = Number(product.total_stock || 0);
  const isOutOfStock = totalStock <= 0;

  const image =
    product.images?.find(
      (img) => img.is_primary === 1 || img.is_primary === true
    )?.image_url ||
    product.images?.[0]?.image_url;

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN")}`;

  return (
    <div
      className={`product-card ${
        isOutOfStock ? "out-of-stock-card" : ""
      }`}
    >
      <Link
        to={`/product/${product.product_id}`}
        className="product-image product-card-link"
      >
        {image ? (
          <img
            src={image}
            alt={product.product_name}
          />
        ) : (
          <div className="no-image">
            No Image Available
          </div>
        )}

        {isOutOfStock && (
          <span className="out-of-stock-label">
            OUT OF STOCK
          </span>
        )}
      </Link>

      <div className="product-info">

        <p className="product-brand">
          {product.brand || "VESTORA"}
        </p>

        <Link
          to={`/product/${product.product_id}`}
          className="product-title-link"
        >
          <h3>{product.product_name}</h3>
        </Link>

        <p>{product.category_name}</p>

        <div className="product-price">
          {product.discount_price ? (
            <>
              <span>
                {formatPrice(product.discount_price)}
              </span>

              <del>
                {formatPrice(product.price)}
              </del>
            </>
          ) : (
            <span>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {!isAdmin && (
          <Link
            to={`/product/${product.product_id}`}
            className="add-to-cart"
          >
            {isOutOfStock ? (
              "VIEW PRODUCT"
            ) : (
              <>
                VIEW PRODUCT
                <ArrowRight size={15} />
              </>
            )}
          </Link>
        )}

      </div>
    </div>
  );
}

export default ProductCard;
