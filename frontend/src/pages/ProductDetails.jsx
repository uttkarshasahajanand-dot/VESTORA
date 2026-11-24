
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ShoppingBag,
  Star,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

import API from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    total_reviews: 0,
    average_rating: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewOrders, setReviewOrders] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "admin";
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/products/${id}`);

      if (response.data.success) {
        setProduct(response.data.product);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load product details."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await API.get(`/reviews/${id}`);

      if (response.data.success) {
        setReviews(response.data.reviews || []);
        setSummary(
          response.data.summary || {
            total_reviews: 0,
            average_rating: 0
          }
        );
      }
    } catch (err) {
      console.error("Reviews loading error:", err);
    }
  };

  const variants = product?.variants || [];

  const sizes = useMemo(
    () => [...new Set(variants.map((variant) => variant.size))],
    [variants]
  );

  const colors = useMemo(
    () => [
      ...new Set(
        variants
          .filter((variant) =>
            selectedSize
              ? variant.size === selectedSize
              : true
          )
          .map((variant) => variant.color)
      )
    ],
    [variants, selectedSize]
  );

  const selectedVariant = variants.find(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColor
  );

  const availableStock = Number(
    selectedVariant?.stock_quantity || 0
  );

  const productImages = product?.images || [];

  const currentImage =
    productImages.find(
      (image) => image.image_id === productImages[activeImage]?.image_id
    )?.image_url;

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSelectedColor("");
    setQuantity(1);
    setMessage("");
  };

  const handleAddToCart = () => {
    setMessage("");

    if (!selectedSize || !selectedColor) {
      setMessage("Please select a size and colour.");
      return;
    }

    if (!selectedVariant || availableStock <= 0) {
      setMessage("This combination is currently out of stock.");
      return;
    }

    if (quantity > availableStock) {
      setMessage(`Only ${availableStock} items are available.`);
      return;
    }

    addToCart(product, selectedVariant);

    setMessage("Product added to your shopping bag successfully!");
  };

  const fetchReviewOrders = async () => {
    try {
      const response = await API.get("/my-orders");

      if (response.data.success) {
        const eligibleOrders = (response.data.orders || [])
          .filter(
            (order) =>
              order.order_status === "delivered" &&
              order.items?.some(
                (item) =>
                  Number(item.product_id) === Number(id)
              )
          );

        setReviewOrders(eligibleOrders);
      }
    } catch (err) {
      console.error("Review orders error:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    if (!isLoggedIn) {
      setReviewMessage("Please log in to submit a review.");
      return;
    }

    if (!reviewOrderId) {
      setReviewMessage("Please select a delivered order.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage("Please enter your review.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await API.post("/reviews", {
        product_id: Number(id),
        order_id: Number(reviewOrderId),
        rating: reviewRating,
        review_title: reviewTitle,
        review_comment: reviewComment
      });

      if (response.data.success) {
        setReviewMessage("Thank you! Your review was submitted.");
        setReviewTitle("");
        setReviewComment("");
        setReviewRating(5);
        setReviewOrderId("");

        await fetchReviews();
        await fetchReviewOrders();
      }
    } catch (err) {
      setReviewMessage(
        err.response?.data?.message ||
        "Unable to submit your review."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      fetchReviewOrders();
    }
  }, [id, isLoggedIn, isAdmin]);

  if (loading) {
    return (
      <div className="product-details-loading">
        <RefreshCw className="loading-icon" size={30} />
        <p>LOADING PRODUCT DETAILS...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-error">
        <h2>Product Unavailable</h2>
        <p>{error || "Product not found."}</p>
        <Link to="/">BACK TO SHOP</Link>
      </div>
    );
  }

  const productStock = Number(product.total_stock || 0);

  return (
    <div className="luxury-product-details-page">

      <div className="product-breadcrumb">
        <Link to="/">HOME</Link>
        <span>/</span>
        <span>{product.category_name || "COLLECTION"}</span>
        <span>/</span>
        <strong>{product.product_name}</strong>
      </div>

      <section className="product-details-container">

        <div className="product-gallery">

          <div className="product-main-image">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.product_name}
              />
            ) : (
              <div className="product-image-placeholder">
                VESTORA
              </div>
            )}

            {productStock <= 0 && (
              <span className="product-detail-out-stock">
                SOLD OUT
              </span>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="product-thumbnail-list">
              {productImages.map((image, index) => (
                <button
                  key={image.image_id}
                  className={
                    activeImage === index
                      ? "product-thumbnail active"
                      : "product-thumbnail"
                  }
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.product_name} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}

        </div>

        <div className="product-detail-information">

          <p className="product-detail-brand">
            {product.brand || "VESTORA"}
          </p>

          <h1>{product.product_name}</h1>

          <div className="product-detail-rating">
            <span className="rating-stars">
              {"★".repeat(Math.round(Number(summary.average_rating || 0)))}
              {"☆".repeat(5 - Math.round(Number(summary.average_rating || 0)))}
            </span>

            <span>
              {Number(summary.average_rating || 0).toFixed(1)}
              {" "}({summary.total_reviews || 0} reviews)
            </span>
          </div>

          <div className="product-detail-price">
            {product.discount_price ? (
              <>
                <strong>
                  {formatPrice(product.discount_price)}
                </strong>
                <del>{formatPrice(product.price)}</del>
              </>
            ) : (
              <strong>{formatPrice(product.price)}</strong>
            )}
          </div>

          <div className="product-detail-divider" />

          <div className="product-description">
            <h3>DESCRIPTION</h3>
            <p>
              {product.description ||
                "Discover timeless style with VESTORA."}
            </p>
          </div>

          <div className="product-detail-divider" />

          {!isAdmin && productStock > 0 && (
            <>
              <div className="variant-selection">

                <div className="variant-heading">
                  <h3>SELECT SIZE</h3>
                  <span>{selectedSize || "Choose your size"}</span>
                </div>

                <div className="size-options">
                  {sizes.map((size) => {
                    const sizeAvailable = variants.some(
                      (variant) =>
                        variant.size === size &&
                        Number(variant.stock_quantity) > 0
                    );

                    return (
                      <button
                        key={size}
                        className={
                          selectedSize === size
                            ? "size-option selected"
                            : "size-option"
                        }
                        disabled={!sizeAvailable}
                        onClick={() => handleSizeChange(size)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

              </div>

              {selectedSize && (
                <div className="variant-selection">

                  <div className="variant-heading">
                    <h3>SELECT COLOUR</h3>
                    <span>{selectedColor || "Choose a colour"}</span>
                  </div>

                  <div className="color-options">
                    {colors.map((color) => {
                      const colorAvailable = variants.some(
                        (variant) =>
                          variant.size === selectedSize &&
                          variant.color === color &&
                          Number(variant.stock_quantity) > 0
                      );

                      return (
                        <button
                          key={color}
                          className={
                            selectedColor === color
                              ? "color-option selected"
                              : "color-option"
                          }
                          disabled={!colorAvailable}
                          onClick={() => {
                            setSelectedColor(color);
                            setQuantity(1);
                            setMessage("");
                          }}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>

                </div>
              )}

              {selectedVariant && (
                <div className="variant-stock-message">
                  {availableStock > 0 ? (
                    <span>
                      <CheckCircle2 size={16} />
                      {availableStock} available
                    </span>
                  ) : (
                    <span>Currently unavailable</span>
                  )}
                </div>
              )}

              <div className="product-quantity-section">
                <h3>QUANTITY</h3>

                <div className="product-quantity-control">
                  <button
                    onClick={() =>
                      setQuantity((previous) =>
                        Math.max(1, previous - 1)
                      )
                    }
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>

                  <span>{quantity}</span>

                  <button
                    onClick={() =>
                      setQuantity((previous) =>
                        Math.min(
                          availableStock,
                          previous + 1
                        )
                      )
                    }
                    disabled={
                      !selectedVariant ||
                      quantity >= availableStock
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                className="product-detail-add-button"
                onClick={handleAddToCart}
                disabled={!selectedVariant || availableStock <= 0}
              >
                <ShoppingBag size={19} />
                ADD TO SHOPPING BAG
              </button>

              {message && (
                <p className="product-action-message">
                  {message}
                </p>
              )}
            </>
          )}

          {productStock <= 0 && (
            <div className="product-sold-out-message">
              This product is currently out of stock.
            </div>
          )}

          {isAdmin && (
            <p className="product-admin-notice">
              Admin account: shopping is disabled.
            </p>
          )}

          <div className="product-service-benefits">

            <div>
              <Truck size={22} />
              <span>
                <strong>Complimentary Shipping</strong>
                <small>On orders above ₹999</small>
              </span>
            </div>

            <div>
              <ShieldCheck size={22} />
              <span>
                <strong>Secure Shopping</strong>
                <small>Safe and reliable checkout</small>
              </span>
            </div>

          </div>

        </div>

      </section>

      <section className="product-reviews-section" id="reviews">

        <div className="product-reviews-heading">
          <p>THE VESTORA COMMUNITY</p>
          <h2>Customer Reviews</h2>
          <span>
            Honest experiences from our customers.
          </span>
        </div>

        <div className="reviews-summary">

          <div className="reviews-average">
            <strong>
              {Number(summary.average_rating || 0).toFixed(1)}
            </strong>

            <div className="rating-stars">
              {"★".repeat(Math.round(Number(summary.average_rating || 0)))}
              {"☆".repeat(5 - Math.round(Number(summary.average_rating || 0)))}
            </div>

            <p>
              Based on {summary.total_reviews || 0} reviews
            </p>
          </div>

        </div>

        {isLoggedIn && !isAdmin && (
          <div className="write-review-card">

            <h3>WRITE A REVIEW</h3>

            {reviewOrders.length === 0 ? (
              <p>
                You can review this product after an order containing it
                has been delivered.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit}>

                <label>SELECT DELIVERED ORDER</label>

                <select
                  value={reviewOrderId}
                  onChange={(e) =>
                    setReviewOrderId(e.target.value)
                  }
                  required
                >
                  <option value="">Choose your order</option>

                  {reviewOrders.map((order) => (
                    <option
                      key={order.order_id}
                      value={order.order_id}
                    >
                      Order #{order.order_id}
                    </option>
                  ))}

                </select>

                <label>YOUR RATING</label>

                <div className="review-star-selector">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={
                        rating <= reviewRating
                          ? "review-star active"
                          : "review-star"
                      }
                      onClick={() => setReviewRating(rating)}
                      aria-label={`${rating} stars`}
                    >
                      <Star
                        size={27}
                        fill={
                          rating <= reviewRating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}
                </div>

                <label>REVIEW TITLE</label>

                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) =>
                    setReviewTitle(e.target.value)
                  }
                  maxLength={150}
                  placeholder="Give your review a title"
                />

                <label>YOUR EXPERIENCE</label>

                <textarea
                  value={reviewComment}
                  onChange={(e) =>
                    setReviewComment(e.target.value)
                  }
                  rows={5}
                  placeholder="Tell us about your experience..."
                  required
                />

                <button
                  type="submit"
                  disabled={reviewLoading}
                >
                  {reviewLoading
                    ? "SUBMITTING..."
                    : "SUBMIT REVIEW"}
                </button>

              </form>
            )}

            {reviewMessage && (
              <p className="review-form-message">
                {reviewMessage}
              </p>
            )}

          </div>
        )}

        {reviews.length === 0 ? (
          <div className="no-product-reviews">
            <Star size={32} />
            <h3>Be the first to review this product</h3>
            <p>Your feedback helps other customers shop confidently.</p>
          </div>
        ) : (
          <div className="customer-reviews-list">

            {reviews.map((review) => (
              <article
                className="customer-review-card"
                key={review.review_id}
              >

                <div className="customer-review-header">
                  <div>
                    <h3>{review.customer_name}</h3>

                    <div className="rating-stars">
                      {"★".repeat(Number(review.rating))}
                      {"☆".repeat(5 - Number(review.rating))}
                    </div>
                  </div>

                  <span>
                    {new Date(review.created_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }
                    )}
                  </span>
                </div>

                {review.review_title && (
                  <h4>{review.review_title}</h4>
                )}

                <p>{review.review_comment}</p>

              </article>
            ))}

          </div>
        )}

      </section>

      <div className="product-back-link">
        <Link to="/">
          <ArrowLeft size={17} />
          CONTINUE EXPLORING VESTORA
        </Link>
      </div>

    </div>
  );
}

export default ProductDetails;
