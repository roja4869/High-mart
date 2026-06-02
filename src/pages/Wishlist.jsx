import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { MOCK_PRODUCTS } from '../services/productService';

// Sub-components
import WishlistCard from '../components/WishlistCard';
import WishlistSummary from '../components/WishlistSummary';
import EmptyWishlist from '../components/EmptyWishlist';
import ProductPreviewModal from '../components/ProductPreviewModal';
import ConfirmationModal from '../components/ConfirmationModal';

// Stylesheet
import '../styles/Wishlist.css';

const Wishlist = () => {
  const { wishlist, setWishlist, addToCart, addToast } = useContext(AppContext);

  // Animation state for items being removed
  const [removingIds, setRemovingIds] = useState([]);

  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [productToPreview, setProductToPreview] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Prepopulate wishlist if empty on initial visit
  useEffect(() => {
    const isInitialized = localStorage.getItem('highMartWishlistInitialized');
    if (!isInitialized && wishlist.length === 0) {
      // Pick 3 items: smart tracker (id 3), ceramic cookware (id 6), canvas backpack (id 8)
      const initialIds = [3, 6, 8];
      const initialItems = MOCK_PRODUCTS.filter(p => initialIds.includes(p.id)).map(p => ({
        ...p,
        image: p.image || (p.images && p.images[0])
      }));
      setWishlist(initialItems);
      localStorage.setItem('highMartWishlistInitialized', 'true');
    }
  }, [wishlist, setWishlist]);

  // Actions
  const handleMoveToCart = (product) => {
    // Add product to cart
    addToCart(product);

    // Animate item exit from wishlist grid
    setRemovingIds(prev => [...prev, product.id]);
    setTimeout(() => {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
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
    setTimeout(() => {
      setWishlist(prev => prev.filter(item => item.id !== targetProduct.id));
      setRemovingIds(prev => prev.filter(id => id !== targetProduct.id));
      addToast(`"${targetProduct.name}" removed from wishlist.`, 'info');
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

    setTimeout(() => {
      // Add all to cart
      wishlist.forEach(item => {
        // Add item to cart (we bypass multiple toasts by adding silent cart actions,
        // or just let it stack - since addToCart uses addToast, let's show a single summary toast instead
        // by customizing if needed, but since addToCart has a built-in toast, it will show them.
        // To make it look extremely premium, we can display a single summary toast)
        addToCart(item);
      });
      
      // Clear wishlist
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
