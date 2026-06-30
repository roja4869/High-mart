import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { authService } from '../services/authService';
import { wishlistService } from '../services/wishlistService';


// Sub-components
import WishlistCard from '../components/WishlistCard';
import WishlistSummary from '../components/WishlistSummary';
import EmptyWishlist from '../components/EmptyWishlist';
import ProductPreviewModal from '../components/ProductPreviewModal';
import ConfirmationModal from '../components/ConfirmationModal';

// Stylesheet
import '../styles/Wishlist.css';

const Wishlist = () => {
  const { wishlist, setWishlist, toggleWishlist, addToCart, addToast } = useContext(AppContext);

  // Animation state for items being removed
  const [removingIds, setRemovingIds] = useState([]);

  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [productToPreview, setProductToPreview] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);



  // Actions
  const handleMoveToCart = (product) => {
    // Add product to cart
    addToCart(product);

    // Animate item exit from wishlist grid
    setRemovingIds(prev => [...prev, product.id]);
    setTimeout(async () => {
      await toggleWishlist(product);
      setRemovingIds(prev => prev.filter(id => id !== product.id));
    }, 300);
  };

  const handleRemoveClick = (product) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!productToDelete) return;
    
    const targetProduct = productToDelete;
    setIsConfirmOpen(false);
    
    // Animate item exit
    setRemovingIds(prev => [...prev, targetProduct.id]);
    setTimeout(async () => {
      await toggleWishlist(targetProduct);
      setRemovingIds(prev => prev.filter(id => id !== targetProduct.id));
      setProductToDelete(null);
    }, 300);
  };

  const handleQuickViewClick = (product) => {
    setProductToPreview(product);
    setIsPreviewOpen(true);
  };

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;

    // Trigger animation for all items
    const allIds = wishlist.map(item => item.id);
    setRemovingIds(allIds);

    setTimeout(async () => {
      // Add all to cart
      wishlist.forEach(item => {
        addToCart(item);
      });
      
      // Clear from database if logged in
      if (authService.isAuthenticated()) {
        try {
          await Promise.all(wishlist.map(item => wishlistService.removeFromWishlist(item.id)));
        } catch (e) {
          console.error("Failed to clear database wishlist:", e.message);
        }
      }

      // Clear wishlist in state
      setWishlist([]);
      setRemovingIds([]);
      addToast(`Moved all items to your shopping cart!`, 'success');
    }, 300);
  };

  // Calculations
  const totalValue = wishlist.reduce((acc, item) => {
    const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
    return acc + discountedPrice;
  }, 0);

  const totalOriginalValue = wishlist.reduce((acc, item) => {
    return acc + item.price;
  }, 0);

  return (
    <div className="wish-page-wrapper section-padding">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="wish-breadcrumb">
          <Link to="/">Home</Link>
          <span className="wish-breadcrumb-separator">&gt;</span>
          <span className="wish-breadcrumb-current">Wishlist</span>
        </div>

        {wishlist.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* Header */}
            <div className="wish-page-header">
              <h1>My Wishlist</h1>
              <span className="wish-items-count">
                You have saved <strong>{wishlist.length}</strong> {wishlist.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Layout Grid */}
            <div className="wish-layout-container">
              {/* Product Cards Grid */}
              <div className="wish-products-grid">
                {wishlist.map(product => (
                  <div 
                    key={product.id} 
                    className={removingIds.includes(product.id) ? 'removing' : ''}
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <WishlistCard
                      product={product}
                      onMoveToCart={handleMoveToCart}
                      onRemove={handleRemoveClick}
                      onQuickView={handleQuickViewClick}
                    />
                  </div>
                ))}
              </div>

              {/* Sidebar Summary Card */}
              <div className="wish-summary-column">
                <WishlistSummary
                  itemsCount={wishlist.length}
                  totalValue={totalValue}
                  totalOriginalValue={totalOriginalValue}
                  onMoveAllToCart={handleMoveAllToCart}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmRemove}
        productName={productToDelete?.name || ''}
      />

      {/* Product Preview Modal */}
      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setProductToPreview(null);
        }}
        product={productToPreview}
        onAddToCart={handleMoveToCart}
      />
    </div>
  );
};

export default Wishlist;
