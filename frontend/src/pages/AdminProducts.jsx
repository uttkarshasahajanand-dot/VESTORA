
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  ImagePlus,
  Tag,
  RefreshCw,
  IndianRupee
} from "lucide-react";

import API from "../services/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    product_name: "",
    description: "",
    price: "",
    discount_price: "",
    brand: "",
    category_id: "",
    image_url: ""
  });

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/products", { headers });

      setProducts(response.data.products || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/products");

      const uniqueCategories = [
        ...new Map(
          (response.data.products || [])
            .filter((product) => product.category_id)
            .map((product) => [
              product.category_id,
              {
                category_id: product.category_id,
                category_name: product.category_name
              }
            ])
        ).values()
      ];

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Category loading failed:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      product_name: "",
      description: "",
      price: "",
      discount_price: "",
      brand: "",
      category_id: "",
      image_url: ""
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const productData = {
        ...form,
        price: Number(form.price),
        discount_price: form.discount_price
          ? Number(form.discount_price)
          : null,
        category_id: Number(form.category_id)
      };

      if (
        productData.discount_price !== null &&
        productData.discount_price >= productData.price
      ) {
        alert("Discount price must be lower than the original price.");
        return;
      }

      if (editingId) {
        await API.put(
          `/admin/products/${editingId}`,
          productData,
          { headers }
        );

        alert("Product updated successfully!");
      } else {
        await API.post(
          "/admin/products",
          productData,
          { headers }
        );

        alert("Product added successfully!");
      }

      resetForm();
      await fetchProducts();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      product_name: product.product_name || "",
      description: product.description || "",
      price: product.price || "",
      discount_price: product.discount_price || "",
      brand: product.brand || "",
      category_id: product.category_id || "",
      image_url: product.image_url || ""
    });

    setEditingId(product.product_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this product from the store?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/products/${id}`, { headers });

      alert("Product removed successfully!");
      await fetchProducts();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to remove product."
      );
    }
  };

  const filteredProducts = products.filter((product) =>
    (product.product_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="luxury-products-page">

      {/* PAGE HEADING */}

      <div className="luxury-products-heading">

        <div>
          <span className="admin-eyebrow">INVENTORY MANAGEMENT</span>
          <h2>Product Collection</h2>
          <p>Manage and organize your VESTORA product catalogue.</p>
        </div>

        <button
          className="luxury-add-product-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          ADD PRODUCT
        </button>

      </div>

      {/* SUMMARY CARDS */}

      <div className="luxury-product-summary">

        <div className="luxury-product-summary-card">
          <div className="summary-icon">
            <Package size={21} />
          </div>
          <div>
            <span>TOTAL PRODUCTS</span>
            <h3>{products.length}</h3>
          </div>
        </div>

        <div className="luxury-product-summary-card">
          <div className="summary-icon">
            <Tag size={21} />
          </div>
          <div>
            <span>ACTIVE PRODUCTS</span>
            <h3>
              {products.filter((p) => p.status === "active").length}
            </h3>
          </div>
        </div>

        <div className="luxury-product-summary-card">
          <div className="summary-icon">
            <IndianRupee size={21} />
          </div>
          <div>
            <span>INACTIVE PRODUCTS</span>
            <h3>
              {products.filter((p) => p.status !== "active").length}
            </h3>
          </div>
        </div>

      </div>

      {/* SEARCH TOOLBAR */}

      <div className="luxury-product-toolbar">

        <div className="luxury-product-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="luxury-product-count">
          SHOWING {filteredProducts.length} PRODUCTS
        </div>

        <button
          className="luxury-product-refresh"
          onClick={fetchProducts}
          disabled={loading}
          title="Refresh products"
        >
          <RefreshCw size={17} />
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="luxury-products-error">
          {error}
        </div>
      )}

      {/* PRODUCT FORM MODAL */}

      {showForm && (
        <div
          className="luxury-product-modal"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              resetForm();
            }
          }}
        >

          <div className="luxury-product-form-box">

            <div className="luxury-product-form-header">

              <div>
                <span className="admin-eyebrow">
                  PRODUCT CATALOGUE
                </span>

                <h2>
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={22} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="luxury-form-field">
                <label>PRODUCT NAME *</label>

                <input
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="luxury-form-field">
                <label>DESCRIPTION</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="luxury-product-form-grid">

                <div className="luxury-form-field">
                  <label>PRICE (₹) *</label>

                  <input
                    type="number"
                    name="price"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="luxury-form-field">
                  <label>DISCOUNT PRICE (₹)</label>

                  <input
                    type="number"
                    name="discount_price"
                    min="0"
                    step="0.01"
                    value={form.discount_price}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

              </div>

              <div className="luxury-product-form-grid">

                <div className="luxury-form-field">
                  <label>BRAND</label>

                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="VESTORA"
                  />
                </div>

                <div className="luxury-form-field">
                  <label>CATEGORY *</label>

                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>

                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="luxury-form-field">
                <label>PRODUCT IMAGE URL</label>

                <div className="luxury-image-input">
                  <ImagePlus size={18} />

                  <input
                    name="image_url"
                    type="url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {form.image_url && (
                <div className="luxury-image-preview">
                  <img
                    src={form.image_url}
                    alt="Product preview"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="luxury-product-form-actions">

                <button
                  type="button"
                  className="luxury-form-cancel"
                  onClick={resetForm}
                  disabled={saving}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="luxury-form-save"
                  disabled={saving}
                >
                  {saving
                    ? "SAVING..."
                    : editingId
                    ? "UPDATE PRODUCT"
                    : "SAVE PRODUCT"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* PRODUCT TABLE */}

      {loading ? (
        <div className="luxury-products-loading">
          <RefreshCw size={24} className="admin-spinning" />
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (

        <div className="luxury-products-empty">
          <Package size={42} />
          <h3>No Products Found</h3>
          <p>Try another search or add a new product to your store.</p>

          <button
            className="luxury-add-product-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={17} />
            ADD PRODUCT
          </button>
        </div>

      ) : (

        <div className="luxury-products-table-container">

          <table className="luxury-products-table">

            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.map((product) => (

                <tr key={product.product_id}>

                  <td>
                    <div className="luxury-product-info">

                      <img
                        src={
                          product.image_url ||
                          "https://placehold.co/80x80?text=Product"
                        }
                        alt={product.product_name}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/80x80?text=Product";
                        }}
                      />

                      <div>
                        <strong>{product.product_name}</strong>
                        <span>{product.brand || "VESTORA"}</span>
                      </div>

                    </div>
                  </td>

                  <td>
                    {product.category_name || "-"}
                  </td>

                  <td>
                    <div className="luxury-product-price">
                      {formatCurrency(
                        product.discount_price || product.price
                      )}

                      {product.discount_price && (
                        <del>{formatCurrency(product.price)}</del>
                      )}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`luxury-product-status ${
                        product.status === "active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {product.status || "inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="luxury-product-actions">

                      <button
                        onClick={() => handleEdit(product)}
                        title="Edit product"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(product.product_id)}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default AdminProducts;
