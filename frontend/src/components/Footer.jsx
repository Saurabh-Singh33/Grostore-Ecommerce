import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "../utils/constants";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container">
        <div className="footer__main">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span>⚡</span> {APP_NAME}
            </Link>
            <p className="footer__tagline">{APP_TAGLINE}</p>
            <p className="footer__desc">
              Your one-stop destination for premium products across electronics, fashion, sports,
              beauty, and home essentials.
            </p>
            <div className="footer__socials">
              {["𝕏", "📘", "📸", "▶️"].map((icon, i) => (
                <a key={i} href="#" className="footer__social-btn">{icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="footer__links-group">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=electronics">Electronics</Link></li>
              <li><Link to="/products?category=fashion">Fashion</Link></li>
              <li><Link to="/products?category=sports">Sports</Link></li>
              <li><Link to="/products?category=beauty">Beauty</Link></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__divider" />

        <div className="footer__bottom">
          <p>© {year} {APP_NAME}. All rights reserved.</p>
          <div className="footer__payment-icons">
            {["💳", "🏦", "📱", "🔒"].map((icon, i) => (
              <span key={i} className="footer__payment-icon">{icon}</span>
            ))}
            <span className="footer__secure">Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
