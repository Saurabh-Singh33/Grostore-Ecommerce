import { Link } from "react-router-dom";
import "./CategoryCard.css";

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/products?category=${category.slug}`} className="category-card">
      <div className="category-card__image-wrap">
        <img
          src={category.image}
          alt={category.name}
          className="category-card__image"
          loading="lazy"
        />
        <div className="category-card__overlay" />
      </div>
      <div className="category-card__body">
        <div className="category-card__icon" style={{ background: `${category.color}22`, border: `1px solid ${category.color}44` }}>
          {category.icon}
        </div>
        <div>
          <h3 className="category-card__name">{category.name}</h3>
          <p className="category-card__desc">{category.description}</p>
          <span className="category-card__count">{category.productCount} Products</span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
