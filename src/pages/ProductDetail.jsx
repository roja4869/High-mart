import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { productService } from '../services/productService';
import { Star, ShoppingCart, Heart, Share2, Plus, Minus, ArrowLeft, Truck, ShieldCheck, RotateCcw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, addToast, user } = useContext(AppContext);
  const isAdmin = user?.role === 'admin';

  // Component State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery controls
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const zoomImageRef = useRef(null);

  // Variant choices state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedStorage, setSelectedStorage] = useState('128GB');
  const [quantity, setQuantity] = useState(1);

  // Related products catalog
  const [relatedProducts, setRelatedProducts] = useState([]);
  const relatedSliderRef = useRef(null);

  // Fetch product detail and related products on mount/id change
  useEffect(() => {
    const fetchDetailData = async () => {
      setLoading(true);
      setError(null);
      try {
        const prod = await productService.getProductById(id);
        if (prod) {
          setProduct(prod);
          setActiveImageIdx(0);
          setQuantity(1);

          // Select default color if available
          if (prod.variants?.colors?.length > 0) {
            setSelectedColor(prod.variants.colors[0]);
          } else {
            setSelectedColor('');
          }

          // Fetch related items by category
          const allProducts = await productService.getProducts();
          const related = allProducts.filter(p => p.category === prod.category && p.id !== prod.id);
          setRelatedProducts(related);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details.');
      } finally {
        // Small delay for skeleton loaders
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchDetailData();
  }, [id]);

  if (error) {
    return (
      <div className="product-error-container section-padding text-center">
        <div className="error-card glass-effect">
          <h2>Oops! Product Not Found</h2>
          <p>{error}</p>
          <Link to="/products" className="back-catalog-btn">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HOVER ZOOM MAGNIFIER LOGIC
  // ----------------------------------------------------
  const handleMouseMove = (e) => {
    if (!zoomImageRef.current || !product?.images) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product.images[activeImageIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%' // double zoom
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // ----------------------------------------------------
  // QUANTITY CONTROL LOGIC
  // ----------------------------------------------------
  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleQuantityInputChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setQuantity(val);
    }
  };

  // ----------------------------------------------------
  // ACTIONS BAR
  // ----------------------------------------------------
  const handleAddToCart = () => {
    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        selectedColor,
        selectedSize: product.category === 'Fashion' ? selectedSize : undefined,
        selectedStorage: product.category === 'Electronics' && product.variants?.storages?.length > 0 ? selectedStorage : undefined
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/dashboard'); // Go directly to checkout dashboard
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard! Share it with friends.', 'success');
  };

  // Related products horizontal scroll action
  const scrollRelated = (direction) => {
    if (relatedSliderRef.current) {
      const scrollAmt = 300;
      relatedSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmt : scrollAmt,
        behavior: 'smooth'
      });
    }
  };

  // Render skeletons while loading
  if (loading || !product) {
    return (
      <div className="detail-page-container section-padding">
        <div className="breadcrumb-nav skeleton-breadcrumbs pulse w-1/4 h-4 mb-8"></div>
        <div className="detail-layout-grid">
          {/* Gallery Skeleton */}
          <div className="gallery-skeleton-container">
            <div className="skeleton-main-img pulse"></div>
            <div className="skeleton-thumbnails">
              <div className="skeleton-thumb pulse"></div>
              <div className="skeleton-thumb pulse"></div>
              <div className="skeleton-thumb pulse"></div>
            </div>
          </div>
          {/* Info Skeleton */}
          <div className="info-skeleton-container">
            <div className="skeleton-line pulse w-1/3 h-6"></div>
            <div className="skeleton-line pulse w-3/4 h-10"></div>
            <div className="skeleton-line pulse w-1/2 h-8"></div>
            <div className="skeleton-line pulse w-1/4 h-12"></div>
            <div className="skeleton-line pulse w-full h-24"></div>
            <div className="skeleton-line pulse w-1/2 h-10"></div>
          </div>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const finalPrice = product.price * (1 - product.discount / 100);

  // Review scores calculations
  const totalReviews = product.reviews?.length || 0;
  const avgRating = product.rating;
  
  // Simulated review distribution (e.g. stars percentages)
  const starDistribution = {
    5: 80,
    4: 15,
    3: 5,
    2: 0,
    1: 0
  };

  return (
    <div className="detail-page-container section-padding">
      
      {/* 1. Breadcrumbs */}
      <div className="breadcrumb-nav">
        <Link to="/">Home</Link>
        <span className="separator">&gt;</span>
        <Link to="/products">Categories</Link>
        <span className="separator">&gt;</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
        <span className="separator">&gt;</span>
        <span className="current-page">{product.name}</span>
      </div>

      <div className="detail-layout-grid">
        
        {/* ==============================================
            LEFT SIDE: GALLERY CONTAINER WITH HOVER ZOOM
            ============================================== */}
        <div className="detail-gallery-column">
          <div 
            className="main-image-display glass-effect"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={zoomImageRef}
          >
            <img 
              src={product.images && product.images[activeImageIdx] ? product.images[activeImageIdx] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
              alt={product.name}
              className="gallery-display-img"
            />
            {/* Magnifier lens preview pane */}
            <div className="image-magnifier-lens" style={zoomStyle}></div>
            
            {/* Wishlist badge overlay */}
            {!isAdmin && (
              <button 
                onClick={() => toggleWishlist(product)}
                className={`wishlist-badge-detail ${isWishlisted ? 'active' : ''}`}
                aria-label="Add to Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
              </button>
            )}
          </div>

          {/* Thumbnails row below */}
          {product.images && product.images.length > 1 && (
            <div className="thumbnails-wrapper">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`thumbnail-card glass-effect ${activeImageIdx === idx ? 'active' : ''}`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ==============================================
            RIGHT SIDE: PRODUCT DETAILS AND INFO
            ============================================== */}
        <div className="detail-info-column">
          <div className="brand-cat-row">
            <span className="detail-cat-badge">{product.category}</span>
            <span className="detail-brand-lbl">Brand: <strong>{product.brand}</strong></span>
          </div>

          <h1 className="detail-product-title">{product.name}</h1>
          
          <div className="sku-ratings-row">
            <span className="sku-lbl">SKU: <strong>{product.sku}</strong></span>
            <span className="divider-bar">|</span>
            <div className="detail-rating-box">
              <div className="stars-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'} 
                    stroke="#f59e0b" 
                  />
                ))}
              </div>
              <span className="rating-avg-num">{avgRating}</span>
              <span className="rating-cnt-lbl">({totalReviews} Customer Reviews)</span>
            </div>
          </div>

          <hr className="detail-divider" />

          {/* Prices Row */}
          <div className="detail-price-box">
            <div className="price-details-row">
              <span className="current-price-tag">₹{finalPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <span className="original-price-tag">₹{product.price.toFixed(2)}</span>
                  <span className="discount-tag">-{product.discount}% OFF</span>
                </>
              )}
            </div>
            
            {/* Stock status indicator */}
            <div className="stock-status-row">
              <span className="dot-pulse-wrapper">
                <span className={`pulse-status-dot ${
                  product.stockStatus === 'In Stock' ? 'success' : product.stockStatus === 'Low Stock' ? 'warning' : 'danger'
                }`}></span>
              </span>
              <span className="stock-status-txt">
                {product.stockStatus} {product.stockCount && `(${product.stockCount} items left)`}
              </span>
            </div>
          </div>

          {/* Description summary */}
          <div className="detail-desc-box">
            <p>{product.description}</p>
          </div>

          {/* Features bullets */}
          {product.features && product.features.length > 0 && (
            <div className="detail-features-box">
              <h4>Key Highlights:</h4>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <hr className="detail-divider" />

          {/* ==============================================
              PRODUCT VARIANTS SELECTIONS
              ============================================== */}
          <div className="variants-selection-wrapper">
            {/* Color chips variant */}
            {product.variants?.colors && product.variants.colors.length > 0 && (
              <div className="variant-row">
                <span className="variant-label">Color:</span>
                <div className="color-chips-container">
                  {product.variants.colors.map(colorHex => (
                    <button
                      key={colorHex}
                      onClick={() => setSelectedColor(colorHex)}
                      className={`color-chip-btn ${selectedColor === colorHex ? 'active' : ''}`}
                      style={{ backgroundColor: colorHex }}
                      aria-label={`Select color ${colorHex}`}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection (Fashion items) */}
            {product.category === 'Fashion' && (
              <div className="variant-row">
                <span className="variant-label">Size:</span>
                <div className="size-chips-container">
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`size-chip-btn ${selectedSize === size ? 'active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage selection (Electronics like smart tracker/headphones) */}
            {product.category === 'Electronics' && (
              <div className="variant-row">
                <span className="variant-label">Storage Capacity:</span>
                <div className="size-chips-container">
                  {['128GB', '256GB', '512GB'].map(storage => (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`size-chip-btn ${selectedStorage === storage ? 'active' : ''}`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ==============================================
              QUANTITY SELECTOR AND ACTION BUTTONS
              ============================================== */}
          <div className="quantity-action-container">
            {!isAdmin && (
              <div className="quantity-selector-box">
                <button 
                  onClick={handleDecrement}
                  className="qty-btn"
                  aria-label="Decrease Quantity"
                >
                  <Minus size={15} />
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={handleQuantityInputChange}
                  className="qty-input"
                  min="1"
                  aria-label="Quantity Count"
                />
                <button 
                  onClick={handleIncrement}
                  className="qty-btn"
                  aria-label="Increase Quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            )}

            <div className="action-buttons-group">
              {isAdmin ? (
                <div className="admin-detail-notice" style={{ padding: '12px 16px', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '8px', color: '#a78bfa', fontSize: '14px', fontWeight: '500', marginRight: '10px' }}>
                  Monitoring Mode: Administrators cannot purchase products.
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleAddToCart}
                    className="add-cart-primary-btn"
                    disabled={product.stockStatus === 'Out of Stock'}
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>

                  <button 
                    onClick={handleBuyNow}
                    className="buy-now-secondary-btn"
                    disabled={product.stockStatus === 'Out of Stock'}
                  >
                    Buy Now
                  </button>
                </>
              )}

              <button 
                onClick={handleShare}
                className="share-utility-btn glass-effect"
                aria-label="Share Product Link"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <hr className="detail-divider" />

          {/* ==============================================
              DELIVERY AND GUARANTEES CARD
              ============================================= */}
          <div className="delivery-info-card glass-effect">
            <div className="info-item">
              <Truck size={20} className="info-icon" />
              <div className="info-txt-box">
                <h5>Free Shipping Available</h5>
                <p>Enjoy free premium delivery on orders above ₹500.</p>
              </div>
            </div>
            <div className="info-item">
              <RotateCcw size={20} className="info-icon" />
              <div className="info-txt-box">
                <h5>30-Days Easy Returns</h5>
                <p>Refunds processed in 2-3 business days without hassle.</p>
              </div>
            </div>
            <div className="info-item">
              <ShieldCheck size={20} className="info-icon" />
              <div className="info-txt-box">
                <h5>Extended Warranty Included</h5>
                <p>Covered by official High Mart manufacturer quality assurance.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ==============================================
          PRODUCT SPECIFICATIONS TABLE SECTION
          ============================================== */}
      <section className="detail-specs-section">
        <h3 className="section-title-underlined">Product Specifications</h3>
        <div className="specs-table-wrapper glass-effect">
          <table className="specs-table">
            <tbody>
              {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                <tr key={key}>
                  <td className="spec-label">{key}</td>
                  <td className="spec-value">{val}</td>
                </tr>
              ))}
              {!product.specifications && (
                <>
                  <tr>
                    <td className="spec-label">Brand</td>
                    <td className="spec-value">{product.brand}</td>
                  </tr>
                  <tr>
                    <td className="spec-label">Category</td>
                    <td className="spec-value">{product.category}</td>
                  </tr>
                  <tr>
                    <td className="spec-label">SKU ID</td>
                    <td className="spec-value">{product.sku}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ==============================================
          CUSTOMER REVIEWS SECTION
          ============================================== */}
      <section className="detail-reviews-section">
        <h3 className="section-title-underlined">Customer Reviews</h3>
        
        <div className="reviews-summary-layout">
          {/* Review score card */}
          <div className="reviews-score-card glass-effect">
            <span className="big-score">{avgRating}</span>
            <div className="stars-row justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'} 
                  stroke="#f59e0b" 
                />
              ))}
            </div>
            <span className="reviews-total-lbl">Based on {totalReviews} reviews</span>
          </div>

          {/* Star percentages chart */}
          <div className="reviews-distribution-card glass-effect">
            {Object.entries(starDistribution).reverse().map(([stars, pct]) => (
              <div key={stars} className="star-row-progress">
                <span className="star-num-lbl">{stars} Star</span>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="pct-num-lbl">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <div className="reviews-list-container">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map(rev => (
              <div key={rev.id} className="review-card glass-effect animate-fade-in">
                <div className="review-card-header">
                  <div className="reviewer-avatar">
                    <img src={rev.avatar} alt={rev.name} />
                  </div>
                  <div className="reviewer-name-meta">
                    <h5>{rev.name}</h5>
                    <span className="review-date-txt">{rev.date}</span>
                  </div>
                  <div className="reviewer-score stars-row">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={14} 
                        fill={idx < rev.stars ? '#f59e0b' : 'none'} 
                        stroke="#f59e0b" 
                      />
                    ))}
                  </div>
                </div>
                <div className="review-card-body">
                  <p>"{rev.comment}"</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-reviews-box glass-effect text-center padding-20">
              <p>No reviews have been written for this product yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </section>

      {/* ==============================================
          RELATED PRODUCTS HORIZONTAL SLIDER
          ============================================== */}
      {relatedProducts.length > 0 && (
        <section className="related-products-slider-section">
          <div className="slider-header-controls">
            <h3 className="section-title-underlined mb-0">Related Products</h3>
            <div className="slider-nav-arrows">
              <button onClick={() => scrollRelated('left')} aria-label="Slide Left">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollRelated('right')} aria-label="Slide Right">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="related-slider-row" ref={relatedSliderRef}>
            {relatedProducts.map(p => (
              <div key={p.id} className="related-product-card glass-effect animate-fade-in">
                <div className="related-image-box">
                  <img src={p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} alt={p.name} />
                  <div className="related-quick-overlay">
                    <Link to={`/product/${p.id}`} className="related-overlay-btn" aria-label="View Product">
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
                <div className="related-details">
                  <h4 className="related-title">
                    <Link to={`/product/${p.id}`}>{p.name}</Link>
                  </h4>
                  <div className="rating-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} fill={i < Math.floor(p.rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                    ))}
                    <span className="rating-txt">{p.rating}</span>
                  </div>
                  <div className="price-add-row">
                    <span className="related-price">₹{(p.price * (1 - p.discount / 100)).toFixed(2)}</span>
                    {!isAdmin && (
                      <button 
                        onClick={() => addToCart(p)}
                        className="related-add-btn"
                        aria-label="Add to Cart"
                      >
                        <ShoppingCart size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;
