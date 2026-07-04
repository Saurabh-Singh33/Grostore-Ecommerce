import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./AppRoutes";

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-container">
      {!isAdminRoute && <Navbar />}
      <AppRoutes />
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
