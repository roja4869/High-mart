import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

const EmptyWishlist = () => {
  return (
    <div className="empty-wish-container">
      <div className="empty-wish-icon-wrapper">
        <Heart size={44} fill="currentColor" />
      </div>
      <h2>Your Wishlist is Empty</h2>
      <p>Save your favorite products here to keep track of them and shop them later.</p>
      <Link to="/products" className="shop-continue-btn">
        <ShoppingBag size={18} />
        <span>Continue Shopping</span>
      </Link>
    </div>
  );
};

export default EmptyWishlist;
