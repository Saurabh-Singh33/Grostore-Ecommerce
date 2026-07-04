import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/helpers";
import "./CartItem.css";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item__image-wrap">
        <img
          src={item.images?.[0] || item.image}
          alt={item.name}
          className="cart-item__image"
          onError={(e) => { e.target.src = "https://placehold.co/100x100/1a1a2e/6366f1?text=?"; }}
        />
      </div>

      <div className="cart-item__details">
        <span className="cart-item__category">{item.category}</span>
        <h3 className="cart-item__name">{item.name}</h3>
        <div className="cart-item__brand">by {item.brand}</div>
      </div>

      <div className="cart-item__qty">
        <button
          className="cart-item__qty-btn"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          aria-label="Decrease quantity"
        >−</button>
        <span className="cart-item__qty-num">{item.quantity}</span>
        <button
          className="cart-item__qty-btn"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          aria-label="Increase quantity"
        >+</button>
      </div>

      <div className="cart-item__price-wrap">
        <div className="cart-item__price">{formatPrice(item.price * item.quantity)}</div>
        {item.quantity > 1 && (
          <div className="cart-item__unit">{formatPrice(item.price)} each</div>
        )}
      </div>

      <button
        className="cart-item__remove"
        onClick={() => removeFromCart(item.id)}
        aria-label="Remove item"
        title="Remove"
      >✕</button>
    </div>
  );
};

export default CartItem;
