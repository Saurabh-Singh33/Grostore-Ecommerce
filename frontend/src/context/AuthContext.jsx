import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/fakeApi";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(email, password);
      setUser(res.data);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(res.data));
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, res.token);
      return { success: true, role: res.data?.role };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(userData);
      setUser(res.data);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(res.data));
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, res.token);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, loading, error, login, signup, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;

  // Fallback prevents full app crash during transient HMR/render timing issues.
  return {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    error: null,
    login: async () => ({ success: false, error: "Auth provider unavailable" }),
    signup: async () => ({ success: false, error: "Auth provider unavailable" }),
    logout: () => {},
    clearError: () => {},
  };
};

export default AuthContext;
