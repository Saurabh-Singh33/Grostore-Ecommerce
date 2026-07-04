export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(price);

export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export const calculateDiscount = (original, current) => {
  if (!original || original === current) return 0;
  return Math.round(((original - current) / original) * 100);
};

export const getStatusColor = (status) => {
  const map = {
    pending: "#f59e0b",
    processing: "#6366f1",
    shipped: "#3b82f6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };
  return map[status] || "#6b7280";
};

export const getStatusBg = (status) => {
  const map = {
    pending: "#fef3c7",
    processing: "#eef2ff",
    shipped: "#dbeafe",
    delivered: "#d1fae5",
    cancelled: "#fee2e2",
  };
  return map[status] || "#f3f4f6";
};

export const sortProducts = (products, sortBy) => {
  const sorted = [...products];
  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.sort((a, b) => b.id - a.id);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
};

export const filterProducts = (products, { category, minPrice, maxPrice, search }) => {
  return products.filter((p) => {
    if (category && category !== "all" && p.category !== category) return false;
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });
};

export const getRatingStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
};

export const generateOrderId = () =>
  `ORD-${Date.now().toString(36).toUpperCase()}`;
