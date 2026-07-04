import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductById, fetchRelatedProducts } from "../services/fakeApi";
import { useCart } from "../context/CartContext";
import ProductGrid from "../components/ProductGrid";
import Loader from "../components/Loader";
import { formatPrice, formatDate } from "../utils/helpers";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then((res) => {
        setProduct(res.data);
        setActiveImage(0);
        setQuantity(1);
        fetchRelatedProducts(id, res.data.category).then((r) => {
          setRelated(r.data);
          setRelatedLoading(false);
        });
      })
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullPage message="Loading product..." />;
  if (!product) return null;

  const inCart = isInCart(product.id || product._id);
  const cartQty = getItemQuantity(product.id || product._id);
  const rating = Number(product.rating ?? 0);
  const reviewCount = Number(product.reviewCount ?? 0);
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  const stars = "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  return (
    <main className="product-details page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="product-details__breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/products">Shop</Link>
          <span>›</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span>›</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-details__grid">
          {/* Images */}
          <div className="product-details__images">
            <div className="product-details__main-image">
              {product.discount > 0 && (
                <span className="product-details__discount-badge">-{product.discount}% OFF</span>
              )}
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="product-details__main-img"
                onError={(e) => { e.target.src = "https://placehold.co/600x500/1a1a2e/6366f1?text=Product"; }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="product-details__thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-details__thumb ${i === activeImage ? "active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-details__info">
            <div className="product-details__category">{product.category}</div>
            <h1 className="product-details__name">{product.name}</h1>
            <div className="product-details__brand">by <strong>{product.brand}</strong></div>

            <div className="product-details__rating">
              <span className="product-details__stars">{stars}</span>
              <span className="product-details__rating-num">{rating.toFixed(1)}</span>
              <span className="product-details__review-count">({reviewCount.toLocaleString()} reviews)</span>
            </div>

            <div className="product-details__price-block">
              <span className="product-details__price">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="product-details__original">{formatPrice(product.originalPrice)}</span>
                  <span className="product-details__savings">
                    You save {formatPrice(product.originalPrice - product.price)}!
                  </span>
                </>
              )}
            </div>

            <div className="product-details__divider" />

            <p className="product-details__description">{product.description}</p>

            {/* Features */}
            <div className="product-details__features">
              {product.features?.map((f, i) => (
                <div key={i} className="product-details__feature">
                  <span>✓</span> {f}
                </div>
              ))}
            </div>

            <div className="product-details__divider" />

            {/* Stock */}
            <div className="product-details__stock">
              {product.stock > 10 ? (
                <span className="product-details__in-stock">✓ In Stock ({product.stock} available)</span>
              ) : product.stock > 0 ? (
                <span className="product-details__low-stock">⚠ Only {product.stock} left!</span>
              ) : (
                <span className="product-details__out-stock">✕ Out of Stock</span>
              )}
            </div>

            {/* Quantity + CTA */}
            <div className="product-details__actions">
              <div className="product-details__qty">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="product-details__qty-btn"
                >−</button>
                <span className="product-details__qty-num">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="product-details__qty-btn"
                  disabled={quantity >= product.stock}
                >+</button>
              </div>

              <button
                className={`btn btn-primary btn-lg product-details__cart-btn ${addedAnim ? "added" : ""}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {addedAnim ? "✓ Added!" : inCart ? `Update Cart (${cartQty})` : "Add to Cart 🛒"}
              </button>
            </div>

            {cartQty > 0 && (
              <Link to="/cart" className="btn btn-secondary w-full" style={{ marginTop: "0.75rem", justifyContent: "center" }}>
                View Cart → ({cartQty} item{cartQty > 1 ? "s" : ""})
              </Link>
            )}

            {/* Tags */}
            <div className="product-details__tags">
              {product.tags?.map((tag) => (
                <span key={tag} className="product-details__tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="product-details__related">
            <div className="section-header">
              <div className="section-label">👀 You May Also Like</div>
              <h2 className="section-title">Related Products</h2>
            </div>
            <ProductGrid products={related} loading={relatedLoading} columns={4} />
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetails;
