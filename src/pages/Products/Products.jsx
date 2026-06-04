import React, { useState, useEffect, useContext, useMemo } from 'react';
import { productService } from '../../services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import Filters from '../../components/Filters/Filters';
import ProductPreviewModal from '../../components/ProductPreviewModal';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { AppContext } from '../../App';
import { CartContext } from '../../context/CartContext';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForPreview, setSelectedProductForPreview] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Pagination count
  const [visibleCount, setVisibleCount] = useState(12);

  // Sorting
  const [sortBy, setSortBy] = useState('newest'); // price-asc, price-desc, rating-desc, newest

  // Shared state from AppContext
  const { addToCart } = useContext(CartContext);
  const { 
    searchQuery, 
    setSearchQuery,
    selectedCategories, 
    setSelectedCategories, 
    priceRange, 
    setPriceRange,
    activeNavbarTab,
    setActiveNavbarTab
  } = useContext(AppContext);

  // Additional sidebar filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState([]);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProducts();
        if (response) {
          setProducts(response);
        }
      } catch (err) {
        console.error('Failed to load products service records:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Parse category search query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      // Set selected categories array
      setSelectedCategories([catParam]);
    }
  }, []);

  // Compute unique brands of currently matching categories to show in sidebar
  const availableBrands = useMemo(() => {
    const relevantProducts = selectedCategories.length === 0 
      ? products 
      : products.filter(p => selectedCategories.includes(p.category));
    return [...new Set(relevantProducts.map(p => p.brand))].sort();
  }, [products, selectedCategories]);

  // Reset pagination count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategories, priceRange, selectedBrands, selectedRating, inStockOnly, activeNavbarTab, selectedGenders]);

  const handlePreviewProduct = (product) => {
    setSelectedProductForPreview(product);
    setIsPreviewOpen(true);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange(15000);
    setSelectedBrands([]);
    setSelectedRating(0);
    setInStockOnly(false);
    setSelectedGenders([]);
    setActiveNavbarTab('categories');
    setSortBy('newest');
  };

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      // 1. Search Query Match
      const matchesSearch = searchQuery.trim() === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Categories Match (Supporting deep path hierarchies)
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(filterPath => {
        if (filterPath === product.category) return true;
        
        if (filterPath.startsWith('Fashion > ')) {
          const parts = filterPath.split(' > ');
          if (product.category !== 'Fashion') return false;
          if (parts[1] && product.subCategory !== parts[1]) return false;
          if (parts[2] && product.gender !== parts[2]) return false;
          if (parts[3] && product.productType !== parts[3]) return false;
          return true;
        }
        return false;
      });

      // 3. Gender Match
      const matchesGender = selectedGenders.length === 0 || 
        (product.gender && selectedGenders.includes(product.gender));

      // 4. Brand Match
      const matchesBrand = selectedBrands.length === 0 ||
        selectedBrands.includes(product.brand);

      // 5. Rating Match
      const matchesRating = product.rating >= selectedRating;

      // 6. Availability (In stock) Match
      const matchesAvailability = !inStockOnly || product.stock > 0;

      // 7. Price Range Match
      const finalPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
      const matchesPrice = finalPrice <= priceRange;

      // 8. Special Navbar tab filters
      let matchesSpecialTab = true;
      if (activeNavbarTab === 'deals') {
        matchesSpecialTab = product.discountPercentage >= 15;
      } else if (activeNavbarTab === 'newArrivals') {
        matchesSpecialTab = product.newArrival === true;
      }

      return matchesSearch && matchesCategory && matchesGender && matchesBrand && matchesRating && matchesAvailability && matchesPrice && matchesSpecialTab;
    });

    // Apply Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pA = a.price * (1 - (a.discountPercentage || 0) / 100);
        const pB = b.price * (1 - (b.discountPercentage || 0) / 100);
        return pA - pB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pA = a.price * (1 - (a.discountPercentage || 0) / 100);
        const pB = b.price * (1 - (b.discountPercentage || 0) / 100);
        return pB - pA;
      });
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id); // higher IDs are newer
    }

    return result;
  }, [products, searchQuery, selectedCategories, selectedGenders, selectedBrands, selectedRating, inStockOnly, priceRange, activeNavbarTab, sortBy]);

  // Paginated/Sliced subset to display
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const remainingCount = filteredProducts.length - paginatedProducts.length;

  return (
    <div className="products-page-container">
      {/* 2-column layout */}
      <div className="products-split-layout">
        {/* Left Column: Sidebar Filters */}
        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          availableBrands={availableBrands}
          onReset={handleResetFilters}
          products={products}
          selectedGenders={selectedGenders}
          setSelectedGenders={setSelectedGenders}
        />

        {/* Right Column: Catalog Grid */}
        <section className="catalog-grid-section">
          {activeNavbarTab === 'deals' && (
            <div className="special-filter-alert glass-effect animate-fade-in">
              <Sparkles size={16} className="alert-spark-icon" />
              <span>Showing high-discount Deals of the Day (15% Off or More).</span>
              <button className="clear-alert-btn" onClick={() => setActiveNavbarTab('categories')}>Show All</button>
            </div>
          )}
          
          {activeNavbarTab === 'newArrivals' && (
            <div className="special-filter-alert glass-effect animate-fade-in">
              <Sparkles size={16} className="alert-spark-icon" />
              <span>Showing New Arrivals & Featured products.</span>
              <button className="clear-alert-btn" onClick={() => setActiveNavbarTab('categories')}>Show All</button>
            </div>
          )}

          {/* Catalog Top Toolbar */}
          <div className="catalog-toolbar-row glass-effect">
            <div className="results-count">
              Showing <span>{paginatedProducts.length}</span> of <span>{filteredProducts.length}</span> Products
            </div>
            
            <div className="sorting-selector-box">
              <label htmlFor="sort-dropdown">Sort By:</label>
              <select 
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="toolbar-select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="products-grid-layout">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="skeleton-product-card glass-effect pulse">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-details">
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-matches-wrapper glass-effect animate-fade-in">
              <SlidersHorizontal size={40} className="no-matches-icon" />
              <h3>No Matches Found</h3>
              <p>We couldn't find any products matching your current catalog filters. Try resetting filters.</p>
              <button 
                onClick={handleResetFilters} 
                className="reset-filters-btn"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid-layout">
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onPreview={handlePreviewProduct}
                  />
                ))}
              </div>

              {/* Load More Pagination */}
              {remainingCount > 0 && (
                <div className="pagination-load-more-row animate-fade-in">
                  <button onClick={handleLoadMore} className="load-more-btn">
                    <span>Load More ({remainingCount} remaining)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Quick View Product Preview Modal */}
      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        product={selectedProductForPreview}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default Products;
