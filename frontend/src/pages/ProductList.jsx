import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { productService } from '../services/productService';
import { Star, ShoppingCart, Heart, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, Eye, ShieldCheck, HelpCircle } from 'lucide-react';
import './ProductList.css';

const ITEMS_PER_PAGE = 6;

const ProductList = () => {
  const { addToCart, toggleWishlist, wishlist } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // API state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting and Pagination State
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);

  // UI state for mobile responsive filters
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available brands in the mock db to render dynamic filters
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Read URL search params on load
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts();
        setProducts(data);

        // Dynamically extract unique categories and brands for filters
        const cats = [...new Set(data.map(p => p.category))];
        const brands = [...new Set(data.map(p => p.brand))];
        setAvailableCategories(cats);
        setAvailableBrands(brands);

        // Set max price limit dynamically
        const maxPrice = Math.ceil(Math.max(...data.map(p => p.price)));
        setPriceRange(prev => ({ ...prev, max: maxPrice }));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        // Small timeout to demonstrate skeleton screen transitions
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchAllData();
  }, []);

  // Update filters if URL parameters change
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');

    if (urlCategory) {
      setSelectedCategories([urlCategory]);
    } else {
      setSelectedCategories([]);
    }
    if (urlSearch) {
      setSearchQuery(urlSearch);
    } else {
      setSearchQuery('');
    }
    setCurrentPage(1);
  }, [searchParams]);

  // Handle price range drag
  const handlePriceChange = (e) => {
    setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }));
    setCurrentPage(1);
  };

  // Toggle Category Selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      const next = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      return next;
    });

    // Clean query parameter when manual filter is selected
    if (searchParams.has('category')) {
      setSearchParams({});
    }
    setCurrentPage(1);
  };

  // Toggle Brand Selection
  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  // Toggle Discount Selection (e.g. 10, 20, 30 percent minimum)
  const handleDiscountToggle = (discountVal) => {
    setSelectedDiscounts(prev => 
      prev.includes(discountVal) ? prev.filter(d => d !== discountVal) : [...prev, discountVal]
    );
    setCurrentPage(1);
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(prev => ({ ...prev, max: Math.ceil(Math.max(...products.map(p => p.price), 200)) }));
    setMinRating(0);
    setSelectedDiscounts([]);
    setInStockOnly(false);
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(1);
  };

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------
  const filteredProducts = products.filter(product => {
    // Search Query (name/brand/category/description)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCat && !matchDesc) return false;
    }

    // Categories filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    // Brands filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }

    // Price range slider (original or current price depending on discount)
    const currentPrice = product.price * (1 - product.discount / 100);
    if (currentPrice < priceRange.min || currentPrice > priceRange.max) {
      return false;
    }

    // Star rating minimum
    if (product.rating < minRating) {
      return false;
    }

    // Discount percentage filters
    if (selectedDiscounts.length > 0) {
      const matchesDiscount = selectedDiscounts.some(minD => product.discount >= minD);
      if (!matchesDiscount) return false;
    }

    // Stock availability filter
    if (inStockOnly && product.stockStatus !== 'In Stock') {
      return false;
    }

    return true;
  });

  // ----------------------------------------------------
  // SORTING LOGIC
  // ----------------------------------------------------
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const finalPriceA = a.price * (1 - a.discount / 100);
    const finalPriceB = b.price * (1 - b.discount / 100);

    if (sortBy === 'price-low') {
      return finalPriceA - finalPriceB;
    } else if (sortBy === 'price-high') {
      return finalPriceB - finalPriceA;
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'newest') {
      // Simulate by sorting SKU desc
      return b.sku.localeCompare(a.sku);
    } else {
      // Popularity default (combination of rating and reviews)
      return (b.rating * b.reviewCount) - (a.rating * a.reviewCount);
    }
  });

  // ----------------------------------------------------
  // PAGINATION LOGIC
  // ----------------------------------------------------
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Jump to top of catalog area on page turn
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="catalog-wrapper section-padding">
      {/* 1. Breadcrumbs */}
      <div className="breadcrumb-nav">
        <Link to="/">Home</Link>
        <span className="separator">&gt;</span>
        <Link to="/products">Categories</Link>
        {selectedCategories.length === 1 && (
          <>
            <span className="separator">&gt;</span>
            <span className="current-page">{selectedCategories[0]}</span>
          </>
        )}
        {selectedCategories.length !== 1 && (
          <>
            <span className="separator">&gt;</span>
            <span className="current-page">All Products</span>
          </>
        )}
      </div>

      {/* Hero Header Area */}
      <div className="catalog-hero-header">
        <h1>
          {selectedCategories.length === 1 ? selectedCategories[0] : 'High Mart Catalog'}
        </h1>
        <p>Premium lifestyle products curated for supreme comfort and quality</p>
      </div>

      {/* Main Layout Grid */}
      <div className="catalog-main-layout">
        
        {/* ==============================================
            SIDEBAR FILTERS (DESKTOP & MOBILE DRAWER)
            ============================================== */}
        <aside className={`catalog-sidebar glass-effect ${mobileFiltersOpen ? 'drawer-open' : ''}`}>
          <div className="sidebar-header">
            <SlidersHorizontal size={18} className="icon-sidebar" />
            <h3>Filters</h3>
            <button 
              className="close-drawer-btn" 
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close Filters Menu"
            >
              <X size={20} />
            </button>
          </div>

          <hr className="filter-divider" />

          {/* Search bar inside filters */}
          <div className="filter-group">
            <h4 className="filter-title">Search In Catalog</h4>
            <div className="search-filter-input">
              <input 
                type="text" 
                placeholder="Type keywords..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Categories</h4>
            <div className="checkbox-list">
              {availableCategories.map(cat => (
                <label key={cat} className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="filter-group">
            <h4 className="filter-title">Price Range</h4>
            <div className="price-slider-box">
              <div className="price-labels">
                <span>₹0</span>
                <span className="active-max">₹{priceRange.max}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 200}
                value={priceRange.max} 
                onChange={handlePriceChange}
                className="custom-range-slider"
              />
              <span className="price-hint">Max Price: ₹{priceRange.max.toFixed(2)}</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Brands</h4>
            <div className="checkbox-list">
              {availableBrands.map(brand => (
                <label key={brand} className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Customer Rating</h4>
            <div className="rating-options-list">
              {[4, 3, 2].map(stars => (
                <button 
                  key={stars} 
                  className={`rating-filter-row ${minRating === stars ? 'active' : ''}`}
                  onClick={() => {
                    setMinRating(minRating === stars ? 0 : stars);
                    setCurrentPage(1);
                  }}
                >
                  <div className="stars-wrapper">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={15} 
                        fill={i < stars ? '#f59e0b' : 'none'} 
                        stroke="#f59e0b" 
                      />
                    ))}
                  </div>
                  <span className="rating-lbl">& Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Discounts</h4>
            <div className="checkbox-list">
              {[10, 20, 30].map(disc => (
                <label key={disc} className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedDiscounts.includes(disc)}
                    onChange={() => handleDiscountToggle(disc)}
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">{disc}% Off & Above</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="filter-group">
            <h4 className="filter-title">Availability</h4>
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={inStockOnly}
                onChange={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
              />
              <span className="checkmark"></span>
              <span className="label-text">In Stock Only</span>
            </label>
          </div>

          {/* Clear Button */}
          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear All Filters
          </button>
        </aside>

        {/* Overlay for mobile side drawer */}
        {mobileFiltersOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setMobileFiltersOpen(false)}
          ></div>
        )}

        {/* ==============================================
            MAIN CATALOG PRODUCTS GRID AND HEADER CONTROLS
            ============================================== */}
        <section className="catalog-products-container">
          
          {/* Grid control bar (Count, Sorting, Mobile Filter Trigger) */}
          <div className="catalog-controls-bar glass-effect">
            <div className="results-counter">
              <span>Showing <strong>{startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of <strong>{totalItems}</strong> products</span>
            </div>

            <div className="controls-right-actions">
              {/* Mobile Filter Button */}
              <button 
                className="mobile-filter-trigger-btn"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </button>

              {/* Sorting Selection */}
              <div className="sorting-wrapper">
                <ArrowUpDown size={15} className="sort-icon" />
                <select 
                  value={sortBy} 
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="sort-dropdown"
                  aria-label="Sort products by"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedCategories.length > 0 || selectedBrands.length > 0 || minRating > 0 || selectedDiscounts.length > 0 || inStockOnly || searchQuery) && (
            <div className="active-badges-row">
              {selectedCategories.map(cat => (
                <span key={cat} className="filter-badge">
                  {cat}
                  <button onClick={() => handleCategoryToggle(cat)}><X size={12} /></button>
                </span>
              ))}
              {selectedBrands.map(b => (
                <span key={b} className="filter-badge">
                  {b}
                  <button onClick={() => handleBrandToggle(b)}><X size={12} /></button>
                </span>
              ))}
              {minRating > 0 && (
                <span className="filter-badge">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(0)}><X size={12} /></button>
                </span>
              )}
              {selectedDiscounts.map(d => (
                <span key={d} className="filter-badge">
                  {d}%+ Off
                  <button onClick={() => handleDiscountToggle(d)}><X size={12} /></button>
                </span>
              ))}
              {inStockOnly && (
                <span className="filter-badge">
                  In Stock
                  <button onClick={() => setInStockOnly(false)}><X size={12} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="filter-badge">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                </span>
              )}
              <button onClick={handleClearFilters} className="clear-badges-anchor">
                Reset All
              </button>
            </div>
          )}

          {/* ==============================================
              PRODUCT CARD GRID OR LOADING SKELETONS
              ============================================== */}
          {loading ? (
            <div className="products-grid-catalog">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="product-card skeleton-card glass-effect">
                  <div className="skeleton-image pulse"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line pulse w-1/3"></div>
                    <div className="skeleton-line pulse w-3/4"></div>
                    <div className="skeleton-line pulse w-1/2"></div>
                    <div className="skeleton-line pulse w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="no-products-found glass-effect animate-fade-in">
              <HelpCircle size={48} className="no-products-icon" />
              <h3>No Matches Found</h3>
              <p>We couldn't find any products matching your specific combinations. Try resetting filters or using a different query search.</p>
              <button onClick={handleClearFilters} className="clear-filters-btn mt-4">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid-catalog">
              {paginatedProducts.map(product => {
                const isWishlisted = wishlist.some(w => w.id === product.id);
                const discountedPrice = product.price * (1 - product.discount / 100);

                return (
                  <div key={product.id} className="product-card glass-effect animate-fade-in">
                    {/* Image Box */}
                    <div className="product-image-box">
                      <img 
                        src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
                        alt={product.name} 
                        className="zoom-image-effect"
                        loading="lazy"
                      />
                      
                      {/* Discount and Stock Badges */}
                      <div className="product-badges">
                        {product.discount > 0 && (
                          <span className="discount-badge">-{product.discount}%</span>
                        )}
                        {product.stockStatus === 'Low Stock' && (
                          <span className="low-stock-badge">Low Stock</span>
                        )}
                      </div>

                      {/* Wishlist Icon */}
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                        aria-label="Add to Wishlist"
                      >
                        <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} />
                      </button>

                      {/* Quick view overlay button */}
                      <div className="card-quick-overlay">
                        <Link to={`/product/${product.id}`} className="quick-view-link-btn">
                          <Eye size={16} />
                          <span>Quick View</span>
                        </Link>
                      </div>
                    </div>

                    {/* Details content */}
                    <div className="product-details-content">
                      <div className="cat-brand-row">
                        <span className="product-cat-lbl">{product.category}</span>
                        <span className="product-brand-lbl">{product.brand}</span>
                      </div>

                      <h3 className="product-title-txt">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                      
                      <p className="product-short-desc">
                        {product.description.slice(0, 75)}...
                      </p>
                      
                      {/* Star Ratings */}
                      <div className="product-rating-stars">
                        <div className="stars-row">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={13} 
                              fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'} 
                              stroke="#f59e0b" 
                            />
                          ))}
                        </div>
                        <span className="rating-num">{product.rating}</span>
                        <span className="review-count">({product.reviewCount})</span>
                      </div>

                      {/* Footer Row (Prices & Add to Cart) */}
                      <div className="product-price-action-row">
                        <div className="price-box">
                          <span className="current-price">₹{discountedPrice.toFixed(2)}</span>
                          {product.discount > 0 && (
                            <span className="old-price">₹{product.price.toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => addToCart(product)}
                          className="add-to-cart-btn"
                          aria-label="Add product to Cart"
                          disabled={product.stockStatus === 'Out of Stock'}
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ==============================================
              PAGINATION NAVIGATION CONTROLS
              ============================================== */}
          {!loading && totalPages > 1 && (
            <div className="pagination-wrapper glass-effect">
              {/* Prev Button */}
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-control-btn"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              {/* Page Numbers */}
              <div className="page-numbers-container">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pNum = index + 1;
                  return (
                    <button 
                      key={pNum} 
                      onClick={() => handlePageChange(pNum)}
                      className={`page-num-btn ${currentPage === pNum ? 'active' : ''}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-control-btn"
                aria-label="Next Page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductList;
