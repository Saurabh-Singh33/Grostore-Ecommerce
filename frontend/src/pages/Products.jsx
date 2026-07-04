import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import ProductGrid from "../components/ProductGrid";
import { SORT_OPTIONS } from "../utils/constants";
import "./Products.css";

const CATEGORIES_WITH_ALL = [
  { slug: "all", name: "All Products", icon: "🛍️" },
  { slug: "electronics", name: "Electronics", icon: "💻" },
  { slug: "fashion", name: "Fashion", icon: "👗" },
  { slug: "sports", name: "Sports", icon: "🏋️" },
  { slug: "beauty", name: "Beauty", icon: "✨" },
  { slug: "home", name: "Home", icon: "🏠" },
];

const Products = () => {
  const {
    filteredProducts,
    loading,
    filters,
    sortBy,
    setSortBy,
    updateFilter,
    resetFilters,
    allProducts,
  } = useProducts();
  const [searchParams] = useSearchParams();
  const [priceInput, setPriceInput] = useState({ min: "", max: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply ?category= from URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) updateFilter("category", cat);
  }, [searchParams]);

  const handlePriceApply = () => {
    updateFilter("minPrice", priceInput.min ? parseFloat(priceInput.min) : 0);
    updateFilter("maxPrice", priceInput.max ? parseFloat(priceInput.max) : Infinity);
  };

  const handleReset = () => {
    resetFilters();
    setPriceInput({ min: "", max: "" });
  };

  const maxProductPrice = allProducts.length
    ? Math.max(...allProducts.map((p) => p.price))
    : 1000;

  return (
    <main className="products-page page-wrapper">
      <div className="container">
        {/* Page Header */}
        <div className="products-page__header">
          <div>
            <h1 className="products-page__title">
              {filters.category === "all"
                ? "All Products"
                : CATEGORIES_WITH_ALL.find((c) => c.slug === filters.category)?.name || "Products"}
            </h1>
            <p className="products-page__count text-muted">
              Showing {filteredProducts.length} results
            </p>
          </div>
          <div className="products-page__toolbar">
            <select
              className="form-select products-page__sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className="btn btn-ghost btn-sm products-page__filter-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              🎛️ Filters
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="products-page__cats">
          {CATEGORIES_WITH_ALL.map((cat) => (
            <button
              key={cat.slug}
              className={`products-page__cat-pill ${filters.category === cat.slug ? "active" : ""}`}
              onClick={() => updateFilter("category", cat.slug)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="products-page__body">
          {/* Sidebar */}
          <aside className={`products-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="products-sidebar__header">
              <h3>Filters</h3>
              <button className="btn btn-ghost btn-sm" onClick={handleReset}>Reset All</button>
            </div>

            {/* Category Filter */}
            <div className="products-sidebar__section">
              <h4>Category</h4>
              {CATEGORIES_WITH_ALL.map((cat) => (
                <label key={cat.slug} className="products-sidebar__radio">
                  <input
                    type="radio"
                    name="category"
                    value={cat.slug}
                    checked={filters.category === cat.slug}
                    onChange={() => updateFilter("category", cat.slug)}
                  />
                  <span>{cat.icon} {cat.name}</span>
                </label>
              ))}
            </div>

            {/* Price Range */}
            <div className="products-sidebar__section">
              <h4>Price Range</h4>
              <div className="products-sidebar__price-inputs">
                <input
                  type="number"
                  placeholder="Min Rs"
                  value={priceInput.min}
                  onChange={(e) => setPriceInput((p) => ({ ...p, min: e.target.value }))}
                  className="form-input"
                  min="0"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max Rs"
                  value={priceInput.max}
                  onChange={(e) => setPriceInput((p) => ({ ...p, max: e.target.value }))}
                  className="form-input"
                  min="0"
                />
              </div>
              <button className="btn btn-primary w-full mt-2" onClick={handlePriceApply}>
                Apply Price Filter
              </button>
            </div>

            {/* Quick Price Ranges */}
            <div className="products-sidebar__section">
              <h4>Quick Ranges</h4>
              {[
                { label: "Under Rs 50", min: 0, max: 50 },
                { label: "Rs 50 – Rs 150", min: 50, max: 150 },
                { label: "Rs 150 – Rs 300", min: 150, max: 300 },
                { label: "Rs 300+", min: 300, max: Infinity },
              ].map((r) => (
                <button
                  key={r.label}
                  className="products-sidebar__quick-range"
                  onClick={() => {
                    updateFilter("minPrice", r.min);
                    updateFilter("maxPrice", r.max);
                    setPriceInput({ min: r.min || "", max: r.max === Infinity ? "" : r.max });
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="products-page__grid-wrap">
            {filters.search && (
              <div className="products-page__search-info">
                🔍 Results for: <strong>"{filters.search}"</strong>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => updateFilter("search", "")}
                >Clear ✕</button>
              </div>
            )}
            <ProductGrid products={filteredProducts} loading={loading} columns={3} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Products;
