import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  fetchProducts,
  fetchCategories,
  fetchFeaturedProducts,
  fetchTrendingProducts,
} from "../services/fakeApi";
import { sortProducts, filterProducts } from "../utils/helpers";

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter / sort state
  const [filters, setFilters] = useState({
    category: "all",
    minPrice: 0,
    maxPrice: Infinity,
    search: "",
  });
  const [sortBy, setSortBy] = useState("newest");

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, featuredRes, trendingRes] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchFeaturedProducts(),
        fetchTrendingProducts(),
      ]);
      setAllProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setFeaturedProducts(featuredRes.data);
      setTrendingProducts(trendingRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Derived: filtered + sorted products
  const filteredProducts = sortProducts(filterProducts(allProducts, filters), sortBy);

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () =>
    setFilters({ category: "all", minPrice: 0, maxPrice: Infinity, search: "" });

  // Admin product mutations (optimistic update)
  const addProduct = (product) => setAllProducts((prev) => [product, ...prev]);
  const updateProduct = (updated) =>
    setAllProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  const deleteProduct = (id) =>
    setAllProducts((prev) => prev.filter((p) => p.id !== id));

  return (
    <ProductContext.Provider
      value={{
        allProducts,
        filteredProducts,
        categories,
        featuredProducts,
        trendingProducts,
        loading,
        error,
        filters,
        sortBy,
        setSortBy,
        updateFilter,
        resetFilters,
        addProduct,
        updateProduct,
        deleteProduct,
        reload: loadInitialData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};

export default ProductContext;
