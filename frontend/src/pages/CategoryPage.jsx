
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, SlidersHorizontal } from "lucide-react";

import API from "../services/api";
import ProductCard from "../components/ProductCard";

function CategoryPage() {
  const { categoryName } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/products");

        const allProducts = response.data.products || [];

        const filteredProducts = allProducts.filter(
          (product) =>
            (product.category_name || "").toLowerCase() ===
              categoryName.toLowerCase() &&
            product.status === "active"
        );

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Category loading error:", err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = Number(a.discount_price || a.price);
    const priceB = Number(b.discount_price || b.price);

    if (sortBy === "price-low") return priceA - priceB;
    if (sortBy === "price-high") return priceB - priceA;
    if (sortBy === "name") {
      return a.product_name.localeCompare(b.product_name);
    }

    return 0;
  });

  const formattedCategory = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    : "Collection";

  return (
    <div className="luxury-category-page">

      {/* CATEGORY HERO */}

      <section className="category-hero">
        <div className="category-hero-content">
          <p>VESTORA COLLECTION</p>

          <h1>{formattedCategory}</h1>

          <span>
            Discover timeless pieces selected for your style.
          </span>

          <div className="category-breadcrumb">
            <Link to="/">HOME</Link>
            <ArrowRight size={14} />
            <span>{formattedCategory.toUpperCase()}</span>
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION */}

      <section className="category-products-section">

        <div className="category-products-heading">
          <div>
            <p className="category-eyebrow">
              THE COLLECTION
            </p>

            <h2>{formattedCategory} Collection</h2>

            <p className="category-count">
              {products.length} PRODUCTS
            </p>
          </div>

          <div className="category-sort">
            <SlidersHorizontal size={19} />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="default">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="category-loading">
            <div className="luxury-spinner"></div>
            <p>LOADING COLLECTION...</p>
          </div>
        ) : error ? (
          <div className="category-message">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="category-product-grid">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="category-message">
            <h3>No products found</h3>
            <p>We are preparing something special for this collection.</p>

            <Link to="/" className="category-back-button">
              EXPLORE HOMEPAGE
            </Link>
          </div>
        )}

      </section>

    </div>
  );
}

export default CategoryPage;
