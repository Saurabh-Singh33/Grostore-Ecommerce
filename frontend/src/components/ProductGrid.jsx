import ProductCard from "./ProductCard";
import Loader from "./Loader";
import "./ProductGrid.css";

const ProductGrid = ({ products, loading, columns = 4 }) => {
  if (loading) {
    return (
      <div className={`product-grid product-grid--cols-${columns}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-grid__skeleton">
            <div className="skeleton" style={{ aspectRatio: "4/3", borderRadius: "var(--radius-md) var(--radius-md) 0 0" }} />
            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div className="skeleton" style={{ height: "12px", width: "40%", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "16px", width: "90%", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "12px", width: "60%", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "18px", width: "35%", borderRadius: "4px" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-grid__empty">
        <div className="product-grid__empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`product-grid product-grid--cols-${columns}`}>
      {products.map((product, idx) => (
        <div key={product._id || product.id || product.slug || idx} style={{ animationDelay: `${idx * 0.05}s` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
