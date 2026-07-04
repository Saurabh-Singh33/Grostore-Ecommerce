import { useState } from "react";
import { useProducts } from "../context/ProductContext";
import { formatPrice } from "../utils/helpers";
import Loader from "../components/Loader";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";
import { adminAddProduct, adminDeleteProduct, adminUpdateProduct } from "../services/fakeApi";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80";

const AdminProducts = () => {
  const { allProducts, reload, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "electronics",
    price: "",
    stock: "",
    brand: "",
    imageUrl: "",
    description: "",
  });

  if (loading) return <Loader fullPage message="Loading products..." />;

  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        brand: product.brand,
        imageUrl: product.images?.[0] || "",
        description: product.description,
      });
    } else {
      setEditing(null);
      setForm({ name: "", category: "electronics", price: "", stock: "", brand: "", imageUrl: "", description: "" });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { imageUrl: imageUrlField, ...restForm } = form;
    const imageUrl = imageUrlField.trim();
    const payload = {
      ...restForm,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      images: imageUrl ? [imageUrl] : editing?.images?.length ? editing.images : [FALLBACK_IMAGE],
    };

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      const productId = editing?.id || editing?._id;

      if (editing) {
        await adminUpdateProduct(productId, payload, token);
      } else {
        await adminAddProduct(payload, token);
      }

      await reload();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      await adminDeleteProduct(id, token);
      await reload();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Products Management</h1>
          <p className="text-muted">Manage your catalog, inventory, and pricing.</p>
        </div>
        <div className="admin-header-actions">
          <input
            type="text"
            className="form-input admin-search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const productId = product.id || product._id;
                return (
                  <tr key={productId}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={product.images?.[0] || FALLBACK_IMAGE} alt={product.name} />
                        <div>
                          <div className="admin-product-cell__name">{product.name}</div>
                          <div className="admin-product-cell__brand">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{product.category}</td>
                    <td className="font-bold">{formatPrice(product.price)}</td>
                    <td>
                      <span className={product.stock < 10 ? "text-danger font-bold" : ""}>
                        {product.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${product.stock > 0 ? "bg-success text-success-dark" : "bg-danger text-danger-dark"}`}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="btn-icon" onClick={() => handleOpenModal(product)} title="Edit">✏️</button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(productId)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: "3rem" }}>No products found matching "{search}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2>{editing ? "Edit Product" : "Add New Product"}</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            {error && <div className="text-danger" style={{ padding: "0 1.25rem 1rem" }}>{error}</div>}
            <form onSubmit={handleSave} className="admin-modal__body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="sports">Sports</option>
                    <option value="beauty">Beauty</option>
                    <option value="home">Home</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/product-image.jpg"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
              <div className="admin-form-row">
                <div className="form-group">
                  <label className="form-label">Price (Rs) *</label>
                  <input required type="number" min="0" step="0.01" className="form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input required type="number" min="0" className="form-input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows="3" className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Save Changes" : "Create Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
