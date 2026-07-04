import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";
import { formatPrice } from "../utils/helpers";
import { createOrder } from "../services/fakeApi";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";
import "./Cart.css";

const Cart = () => {
  const { cartItems, cartCount, subtotal, shipping, tax, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  if (cartItems.length === 0) {
    return (
      <main className="cart-page page-wrapper">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty__icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg">Start Shopping →</Link>
          </div>
        </div>
      </main>
    );
  }

  // Success screen after placing from cart
  if (orderId) {
    return (
      <main className="checkout-page page-wrapper">
        <div className="container">
          <div className="checkout-success">
            <div className="checkout-success__icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order <strong>{orderId}</strong> has been confirmed.</p>
            <p className="text-muted">You'll receive a confirmation email shortly.</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "center" }}>
              <Link to="/" className="btn btn-primary btn-lg">Continue Shopping</Link>
              <Link to="/profile" className="btn btn-secondary btn-lg">View Orders</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page page-wrapper">
      <div className="container">
        <div className="cart-page__header">
          <h1 className="cart-page__title">Shopping Cart</h1>
          <span className="cart-page__count">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
        </div>

        <div className="cart-page__grid">
          {/* Items */}
          <div className="cart-page__items">
            <div className="cart-page__items-header">
              <span>Products</span>
              <button className="btn btn-danger btn-sm" onClick={clearCart}>Clear All</button>
            </div>
            <div className="cart-page__items-list">
              {cartItems.map((item, idx) => (
                <CartItem
                  key={item._id ?? item.id ?? item.slug ?? `${item.name}-${idx}`}
                  item={item}
                />
              ))}
            </div>
            <Link to="/products" className="cart-page__continue">← Continue Shopping</Link>
          </div>

          {/* Summary */}
          <div className="cart-page__summary">
            <h3 className="cart-summary__title">Order Summary</h3>

            <div className="cart-summary__lines">
              <div className="cart-summary__line">
                <span>Subtotal ({cartCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary__line">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-success" : ""}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="cart-summary__line">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {shipping > 0 && (
                <div className="cart-summary__free-ship">
                  Add {formatPrice(100 - subtotal)} more for free shipping!
                </div>
              )}
            </div>

            <div className="cart-summary__total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {isAuthenticated ? (
              <button
                className="btn btn-primary btn-lg w-full cart-summary__checkout"
                onClick={async () => {
                  if (cartItems.length === 0) return alert("Your cart is empty");
                  setPlacing(true);
                  try {
                    const orderData = {
                      userId: user?.id || 0,
                      items: cartItems.map((i) => ({
                        productId: i.id,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                        image: i.images?.[0],
                      })),
                      total,
                      shippingAddress: user?.address || {},
                      paymentMethod: "credit_card",
                    };
                    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
                    const res = await createOrder(orderData, token);
                    clearCart();
                    try { localStorage.removeItem(LOCAL_STORAGE_KEYS.CART); } catch (e) {}
                    setOrderId(res.data.id);
                  } catch (err) {
                    alert("Order failed: " + (err.message || err));
                  } finally {
                    setPlacing(false);
                  }
                }}
                disabled={placing}
              >
                {placing ? "Placing Order..." : "Place Order →"}
              </button>
            ) : (
              <button className="btn btn-primary btn-lg w-full cart-summary__checkout" onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}>
                Sign in to Place Order →
              </button>
            )}

            <div className="cart-summary__trust">
              <span>🔒 Secure Checkout</span>
              <span>🚚 Fast Delivery</span>
              <span>↩️ Easy Returns</span>
            </div>

            {/* Promo code (mock) */}
            <div className="cart-summary__promo">
              <div className="cart-summary__promo-label">Have a promo code?</div>
              <div className="cart-summary__promo-input">
                <input type="text" placeholder="Enter code" className="form-input" />
                <button className="btn btn-secondary btn-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
