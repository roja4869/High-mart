import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';

const EmptyCart = () => {
  return (
    <div className="empty-cart-container">
      <div className="empty-cart-icon-wrapper">
        <ShoppingCart size={48} />
      </div>
      <h2>Your Cart is Empty</h2>
      <p>Looks like you haven't added any products yet.</p>
      <Link to="/products" className="shop-now-primary-btn">
        <span>Shop Now</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
};

export default EmptyCart;
