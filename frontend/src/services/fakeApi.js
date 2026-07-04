/*
  This file falls back to the local mock data when `import.meta.env.VITE_API_URL` is not set.
  When `VITE_API_URL` is present the functions call the real backend API.
*/

let mockProducts = [];
let mockCategories = [];
let mockUsers = [];
let mockOrders = [];

const API = import.meta.env.VITE_API_URL || null;

const apiFetch = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const data = await res.json();
      if (data?.message) {
        message = data.message;
      } else if (typeof data === "string") {
        message = data;
      }
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
};

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const loadMocks = async () => {
  // Mock data removed after moving to backend. Keep empty fallbacks to avoid Vite import errors.
  mockProducts = [];
  mockCategories = [];
  mockUsers = [];
  mockOrders = [];
};

// Products
export const fetchProducts = async () => {
  if (!API) {
    await loadMocks();
    await delay();
    return { data: mockProducts, success: true };
  }
  return apiFetch(`${API}/api/products`);
};

export const fetchProductById = async (id) => {
  if (!API) {
    await loadMocks();
    await delay();
    const product = mockProducts.find((p) => p.id === parseInt(id) || p.slug === id);
    if (!product) throw new Error("Product not found");
    return { data: product, success: true };
  }
  return apiFetch(`${API}/api/products/${id}`);
};

export const fetchProductsByCategory = async (category) => {
  if (!API) {
    await loadMocks();
    await delay();
    const filtered = mockProducts.filter((p) => p.category === category);
    return { data: filtered, success: true };
  }
  return apiFetch(`${API}/api/products?category=${encodeURIComponent(category)}`);
};

export const fetchFeaturedProducts = async () => {
  if (!API) {
    await loadMocks();
    await delay();
    return { data: mockProducts.filter((p) => p.isFeatured), success: true };
  }
  return apiFetch(`${API}/api/products?featured=true`);
};

export const fetchTrendingProducts = async () => {
  if (!API) {
    await loadMocks();
    await delay();
    return { data: mockProducts.filter((p) => p.isTrending), success: true };
  }
  return apiFetch(`${API}/api/products?trending=true`);
};

export const fetchRelatedProducts = async (productId, category) => {
  if (!API) {
    await loadMocks();
    await delay(300);
    const related = mockProducts
      .filter((p) => p.category === category && p.id !== parseInt(productId))
      .slice(0, 4);
    return { data: related, success: true };
  }
  return apiFetch(`${API}/api/products?category=${encodeURIComponent(category)}&exclude=${productId}`);
};

// Categories
export const fetchCategories = async () => {
  if (!API) {
    await loadMocks();
    await delay();
    return { data: mockCategories, success: true };
  }
  return apiFetch(`${API}/api/categories`);
};

// Users
export const loginUser = async (email, password) => {
  if (!API) {
    await loadMocks();
    await delay(600);
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    const { password: _pw, ...safeUser } = user;
    return { data: safeUser, token: `mock_token_${user.id}_${Date.now()}`, success: true };
  }
  return apiFetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (userData) => {
  if (!API) {
    await loadMocks();
    await delay(600);
    const exists = mockUsers.find((u) => u.email === userData.email);
    if (exists) throw new Error("Email already registered");
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      role: "user",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`,
      joinedAt: new Date().toISOString().split("T")[0],
      isActive: true,
    };
    mockUsers.push(newUser);
    const { password: _pw, ...safeUser } = newUser;
    return { data: safeUser, token: `mock_token_${newUser.id}_${Date.now()}`, success: true };
  }
  return apiFetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
};

export const fetchUsers = async (token) => {
  if (!API) {
    await loadMocks();
    await delay();
    return { data: mockUsers.map(({ password: _pw, ...u }) => u), success: true };
  }
  return apiFetch(`${API}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Orders
export const fetchOrders = async (token) => {
  if (!API) {
    await loadMocks();
    await delay();
    return { data: mockOrders, success: true };
  }
  return apiFetch(`${API}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
};

export const fetchOrdersByUser = async (userId, token) => {
  if (!API) {
    await loadMocks();
    await delay();
    const userOrders = mockOrders.filter((o) => o.userId === userId);
    return { data: userOrders, success: true };
  }
  return apiFetch(`${API}/api/orders/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const createOrder = async (orderData, token) => {
  if (!API) {
    await loadMocks();
    await delay(800);
    const newOrder = {
      id: `ORD-${String(mockOrders.length + 1).padStart(3, "0")}`,
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      deliveredAt: null,
    };
    mockOrders.push(newOrder);
    return { data: newOrder, success: true };
  }
  return apiFetch(`${API}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(orderData),
  });
};

export const updateOrderStatus = async (orderId, status, token) => {
  if (!API) {
    await loadMocks();
    await delay();
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    order.status = status;
    if (status === "delivered") order.deliveredAt = new Date().toISOString().split("T")[0];
    return { data: order, success: true };
  }
  return apiFetch(`${API}/api/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
};

export const cancelMyOrder = async (orderId, token) => {
  if (!API) {
    await loadMocks();
    await delay();
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    if (!["pending", "processing"].includes(order.status)) {
      throw new Error("Only pending or processing orders can be cancelled");
    }
    order.status = "cancelled";
    return { data: order, success: true };
  }

  return apiFetch(`${API}/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const cancelOrderItem = async (orderId, itemIndex, token) => {
  if (!API) {
    await loadMocks();
    await delay();
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    if (!["pending", "processing"].includes(order.status)) {
      throw new Error("Items can be cancelled only when order is pending or processing");
    }
    if (!order.items?.[itemIndex]) {
      throw new Error("Order item not found");
    }
    order.items[itemIndex].status = "cancelled";
    order.items[itemIndex].cancelledAt = new Date().toISOString();
    const activeItems = order.items.filter((item) => (item.status || "active") !== "cancelled");
    order.total = activeItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    if (activeItems.length === 0) {
      order.status = "cancelled";
    }
    return { data: order, success: true };
  }

  return apiFetch(`${API}/api/orders/${orderId}/items/${itemIndex}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Admin Product CRUD
export const adminUpdateProduct = async (id, updates, token) => {
  if (!API) {
    await loadMocks();
    await delay();
    const idx = mockProducts.findIndex((p) => p.id === parseInt(id));
    if (idx === -1) throw new Error("Product not found");
    mockProducts[idx] = { ...mockProducts[idx], ...updates };
    return { data: mockProducts[idx], success: true };
  }
  return apiFetch(`${API}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
};

export const adminDeleteProduct = async (id, token) => {
  if (!API) {
    await loadMocks();
    await delay();
    const idx = mockProducts.findIndex((p) => p.id === parseInt(id));
    if (idx === -1) throw new Error("Product not found");
    mockProducts.splice(idx, 1);
    return { success: true };
  }
  return apiFetch(`${API}/api/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const adminAddProduct = async (productData, token) => {
  if (!API) {
    await loadMocks();
    await delay();
    const newProduct = {
      id: Math.max(...mockProducts.map((p) => p.id)) + 1,
      ...productData,
      rating: 0,
      reviewCount: 0,
      isFeatured: false,
      isTrending: false,
    };
    mockProducts.push(newProduct);
    return { data: newProduct, success: true };
  }
  return apiFetch(`${API}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(productData),
  });
};
