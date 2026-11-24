
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";

import API from "../services/api";
import ProductGrid from "../components/ProductGrid";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/products");

        const allProducts = response.data.products || [];

        setProducts(
          allProducts.filter(
            (product) => product.status === "active"
          )
        );
      } catch (err) {
        console.error("Products loading error:", err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    {
      name: "MEN",
      path: "/category/men",
      image:
        "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900"
    },
    {
      name: "WOMEN",
      path: "/category/women",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900"
    },
    {
      name: "SHOES",
      path: "/category/shoes",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"
    },
    {
      name: "ACCESSORIES",
      path: "/category/accessories",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900"
    }
  ];

  return (
    <div className="luxury-home">

      {/* HERO SECTION */}

      <section className="luxury-hero">
        <div className="luxury-hero-image"></div>

        <div className="luxury-hero-overlay"></div>

        <div className="luxury-hero-content">
          <p className="hero-subtitle">
            THE NEW COLLECTION
          </p>

          <h1>
            Elegance in
            <br />
            Every Detail.
          </h1>

          <p className="hero-description">
            Discover timeless fashion designed to
            express your individuality.
          </p>

          <Link to="/category/men" className="hero-button">
            EXPLORE COLLECTION
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="hero-bottom-text">
          VESTORA — STYLE THAT DEFINES YOU
        </div>
      </section>

      {/* BRAND INTRODUCTION */}

      <section className="luxury-intro">
        <p className="luxury-eyebrow">
          THE VESTORA EXPERIENCE
        </p>

        <h2>
          Style is a statement.
          <br />
          Make yours timeless.
        </h2>

        <p>
          Thoughtfully selected styles, refined details and
          effortless elegance. Discover fashion that feels
          as exceptional as it looks.
        </p>
      </section>

      {/* CATEGORY COLLECTIONS */}

      <section className="luxury-categories">
        <div className="luxury-section-heading">
          <div>
            <p className="luxury-eyebrow">
              CURATED FOR YOU
            </p>

            <h2>Explore Collections</h2>
          </div>

          <span>01 — 04</span>
        </div>

        <div className="luxury-category-grid">
          {categories.map((category, index) => (
            <Link
              to={category.path}
              className="luxury-category-card"
              key={category.name}
            >
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
              />

              <div className="luxury-category-overlay">
                <span>0{index + 1}</span>

                <h3>{category.name}</h3>

                <p>
                  DISCOVER MORE <ArrowRight size={15} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}

      <section className="luxury-featured">
        <div className="luxury-section-heading">
          <div>
            <p className="luxury-eyebrow">
              HANDPICKED FOR YOU
            </p>

            <h2>Featured Pieces</h2>
          </div>

          <Link to="/category/men" className="view-all-link">
            VIEW COLLECTION <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="luxury-loading">
            <div className="luxury-spinner"></div>
            <p>DISCOVERING YOUR STYLE...</p>
          </div>
        ) : error ? (
          <div className="luxury-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              TRY AGAIN
            </button>
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products.slice(0, 8)} />
        ) : (
          <div className="luxury-empty">
            <h3>No products available</h3>
            <p>New collections are coming soon.</p>
          </div>
        )}
      </section>

      {/* PROMOTIONAL BANNER */}

      <section className="luxury-promo">
        <div className="luxury-promo-content">
          <p className="luxury-eyebrow">
            LESS, BUT BETTER
          </p>

          <h2>
            Designed to be
            <br />
            remembered.
          </h2>

          <p>
            Find your signature look with VESTORA's
            thoughtfully curated collection.
          </p>

          <Link to="/category/women" className="promo-button">
            SHOP NOW <ArrowRight size={17} />
          </Link>
        </div>

        <div className="luxury-promo-image"></div>
      </section>

      {/* BRAND BENEFITS */}

      <section className="luxury-benefits">
        <div className="benefit-item">
          <Truck size={27} strokeWidth={1.4} />
          <h3>COMPLIMENTARY SHIPPING</h3>
          <p>On orders above ₹999</p>
        </div>

        <div className="benefit-item">
          <ShieldCheck size={27} strokeWidth={1.4} />
          <h3>SECURE CHECKOUT</h3>
          <p>Shop with confidence</p>
        </div>

        <div className="benefit-item">
          <RefreshCw size={27} strokeWidth={1.4} />
          <h3>EASY RETURNS</h3>
          <p>Simple return experience</p>
        </div>
      </section>

    </div>
  );
}

export default Home;
