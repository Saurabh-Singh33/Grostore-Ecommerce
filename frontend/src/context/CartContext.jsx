import { createContext, useContext, useState, useEffect } from "react";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      const parsed = stored ? JSON.parse(stored) : [];
      // Clean up potentially corrupted items (from before ID fix)
      return Array.isArray(parsed) ? parsed.filter(item => item.id != null) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const normalizedProduct = { ...product, id: product.id || product._id };
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === normalizedProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.id === normalizedProduct.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, normalizedProduct.stock) }
            : item
        );
      }
      return [...prev, { ...normalizedProduct, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  const isInCart = (productId) => cartItems.some((item) => item.id === productId);

  const getItemQuantity = (productId) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        shipping,
        tax,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export default CartContext;
