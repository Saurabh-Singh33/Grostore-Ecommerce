import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/helpers";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const productId = product.id || product._id;
  const inCart = isInCart(productId);
  const rating = Number(product.rating ?? 0);
  const reviewCount = Number(product.reviewCount ?? 0);
  const stock = Number(product.stock ?? 0);
  const imageSrc = product.images?.[0] || "https://placehold.co/400x300/1a1a2e/6366f1?text=No+Image";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  const stars = "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);

  return (
    <Link to={`/products/${productId}`} className="product-card">
      <div className="product-card__image-wrap">
        <img
          src={imageSrc}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
          onError={(e) => { e.target.src = "https://placehold.co/400x300/1a1a2e/6366f1?text=No+Image"; }}
        />
        {product.discount > 0 && (
          <span className="product-card__badge">-{product.discount}%</span>
        )}
        <div className="product-card__overlay">
          <button
            className={`product-card__cart-btn ${inCart ? "in-cart" : ""}`}
            onClick={handleAddToCart}
          >
            {inCart ? "✓ In Cart" : "Add to Cart"}
          </button>
        </div>
        {product.isTrending && (
          <span className="product-card__trending">🔥 Trending</span>
        )}
      </div>

      <div className="product-card__body">
        <div className="product-card__category">{product.category}</div>
        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__rating">
          <span className="product-card__stars">{stars}</span>
          <span className="product-card__rating-count">({reviewCount.toLocaleString()})</span>
        </div>

        <div className="product-card__price-row">
          <div>
            <span className="product-card__price">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="product-card__original">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <span className={`product-card__stock ${stock < 10 ? "low" : ""}`}>
            {stock <= 0 ? "Out of Stock" : stock < 10 ? `Only ${stock} left!` : "In Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
