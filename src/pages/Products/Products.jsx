import React, { useState, useEffect, useContext, useMemo } from 'react';
import { productService } from '../../services/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import Filters from '../../components/Filters/Filters';
import ProductPreviewModal from '../../components/ProductPreviewModal';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { AppContext } from '../../App';
import { CartContext } from '../../context/CartContext';
import { motion } from 'framer-motion';
import './Products.css';

const CATEGORY_IDS = {
  'electronics': 1,
  'fashion': 2,
  'groceries': 3,
  'home & kitchen': 4,
  'beauty': 5,
  'toys': 6,
  'books': 7,
  'sports': 8
};

const SUBCATEGORY_IDS = {
  'Fashion > Clothing': 1,
  'Fashion > Clothing > Men': 2,
  'Fashion > Clothing > Men > T-Shirt': 3,
  'Fashion > Clothing > Men > Shirt': 4,
  'Fashion > Clothing > Men > Jeans': 5,
  'Fashion > Clothing > Men > Trousers': 6,
  'Fashion > Clothing > Men > Jacket': 7,
  'Fashion > Clothing > Men > Hoodie': 8,
  'Fashion > Clothing > Women': 9,
  'Fashion > Clothing > Women > Saree': 10,
  'Fashion > Clothing > Women > Kurti': 11,
  'Fashion > Clothing > Women > Dress': 12,
  'Fashion > Clothing > Women > Top': 13,
  'Fashion > Clothing > Women > Jeans': 14,
  'Fashion > Clothing > Women > Jacket': 15,
  'Fashion > Clothing > Kids': 16,
  'Fashion > Clothing > Kids > Boys Wear': 17,
  'Fashion > Clothing > Kids > Girls Wear': 18,
  'Fashion > Clothing > Kids > School Uniform': 19,
  'Fashion > Clothing > Kids > Party Wear': 20,
  'Fashion > Footwear': 21,
  'Fashion > Footwear > Men': 22,
  'Fashion > Footwear > Men > Sports Shoes': 23,
  'Fashion > Footwear > Men > Sneakers': 24,
  'Fashion > Footwear > Men > Formal Shoes': 25,
  'Fashion > Footwear > Men > Sandals': 26,
  'Fashion > Footwear > Women': 27,
  'Fashion > Footwear > Women > Heels': 28,
  'Fashion > Footwear > Women > Flats': 29,
  'Fashion > Footwear > Women > Sneakers': 30,
  'Fashion > Footwear > Women > Sandals': 31,
  'Fashion > Footwear > Kids': 32,
  'Fashion > Footwear > Kids > School Shoes': 33,
  'Fashion > Footwear > Kids > Casual Shoes': 34,
  'Fashion > Footwear > Kids > Sports Shoes': 35,
  'Fashion > Eyewear': 36,
  'Fashion > Eyewear > Men': 37,
  'Fashion > Eyewear > Men > Sunglasses': 38,
  'Fashion > Eyewear > Men > Reading Glasses': 39,
  'Fashion > Eyewear > Men > Computer Glasses': 40,
  'Fashion > Eyewear > Women': 41,
  'Fashion > Eyewear > Women > Sunglasses': 42,
  'Fashion > Eyewear > Women > Fashion Glasses': 43,
  'Fashion > Eyewear > Women > Reading Glasses': 44,
  'Fashion > Eyewear > Kids': 45,
  'Fashion > Eyewear > Kids > Sunglasses': 46,
  'Fashion > Eyewear > Kids > Protective Glasses': 47,
  'Fashion > Bags': 48,
  'Fashion > Bags > Men': 49,
  'Fashion > Bags > Women': 50,
  'Fashion > Bags > Kids': 51,
  'Fashion > Watches': 52,
  'Fashion > Watches > Men': 53,
  'Fashion > Watches > Women': 54,
  'Fashion > Watches > Kids': 55,
  'Fashion > Accessories': 56,
  'Fashion > Accessories > Belt': 57,
  'Fashion > Accessories > Cap': 58,
  'Fashion > Accessories > Wallet': 59,
  'Fashion > Accessories > Jewellery': 60,
  'Fashion > Accessories > Hair Accessories': 61,
  'Fashion > Accessories > Scarf': 62
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      const params = {};

      // 1. Category/Subcategory matching from selectedCategories
      if (selectedCategories.length > 0) {
        const activePath = selectedCategories[0]; // first selected category path
        const pathParts = activePath.split(' > ');
        if (pathParts[0]) {
          params.category = pathParts[0];
        }
        if (pathParts.length > 1) {
          params.subcategory = pathParts[pathParts.length - 1];
        }
      }

      // 2. Search Query
      if (searchQuery.trim() !== '') {
        params.search = searchQuery;
      }

      // 3. Gender Filter
      if (selectedGenders.length > 0) {
        params.gender = selectedGenders.join(',');
      }

      console.log("Fetching products with params:", params);
      try {
        const response = await productService.getProducts(params);
        if (response) {
          console.log(`Successfully fetched ${response.length} products.`);
          setProducts(response);
        }
      } catch (err) {
        console.error('Failed to load products service records:', err);
        setError('Failed to fetch products from server. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategories, searchQuery, selectedGenders, activeNavbarTab]);

  // Parse category search query param on mount and location search updates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setSelectedCategories([catParam]);
    }
  }, [window.location.search]);

  // Compute unique brands of currently matching categories to show in sidebar
  const availableBrands = useMemo(() => {
    const relevantProducts = selectedCategories.length === 0 
      ? products 
      : products.filter(product => {
          return selectedCategories.some(filterPath => {
            let prodPath = product.category || '';
            if (product.subCategory) prodPath += ` > ${product.subCategory}`;
            if (product.gender) prodPath += ` > ${product.gender}`;
            if (product.productType) prodPath += ` > ${product.productType}`;
            return prodPath === filterPath || prodPath.startsWith(filterPath + ' > ');
          });
        });
    return [...new Set(relevantProducts.map(p => p.brand).filter(Boolean))].sort();
  }, [products, selectedCategories]);

  // Reset pagination count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategories, priceRange, selectedBrands, selectedRating, inStockOnly, activeNavbarTab, selectedGenders]);

  const handlePreviewProduct = (product) => {
    setSelectedProductForPreview(product);
    setIsPreviewOpen(true);
  };

  const getEmptyStateText = () => {
    if (selectedCategories.length > 0) {
      const activePath = selectedCategories[0];
      if (activePath.includes(' > ')) {
        const parts = activePath.split(' > ');
        const subcatName = parts[parts.length - 1];
        if (subcatName.toLowerCase() === 'clothing' || subcatName.toLowerCase() === 'clothes') {
          return 'No clothes products found';
        }
        return `No ${subcatName.toLowerCase()} products found`;
      }
    }
    return "We couldn't find any products matching your current catalog filters. Try resetting filters.";
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
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (product.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Categories Match (Supporting deep path hierarchies)
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(filterPath => {
        let prodPath = product.category || '';
        if (product.subCategory) prodPath += ` > ${product.subCategory}`;
        if (product.gender) prodPath += ` > ${product.gender}`;
        if (product.productType) prodPath += ` > ${product.productType}`;
        return prodPath === filterPath || prodPath.startsWith(filterPath + ' > ');
      });

      // 3. Gender Match
      const isGenderSpecific = product.category === 'Fashion';

      let matchesGender = true;
      if (selectedGenders.length > 0) {
        if (isGenderSpecific) {
          matchesGender = product.gender && selectedGenders.includes(product.gender);
        } else {
          matchesGender = true;
        }
      }

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
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="catalog-grid-section"
        >
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

          {error ? (
            <div className="error-message-wrapper glass-effect animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <h3>Unable to Load Products</h3>
              <p>{error}</p>
              <button 
                onClick={() => {
                  setSelectedCategories([...selectedCategories]); // triggers reload
                }} 
                className="retry-btn"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="loading-spinner-wrapper">
              <div className="loading-spinner"></div>
              <p>Fetching products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-matches-wrapper glass-effect animate-fade-in">
              <SlidersHorizontal size={40} className="no-matches-icon" />
              <h3>No Matches Found</h3>
              <p>{getEmptyStateText()}</p>
              <button 
                onClick={handleResetFilters} 
                className="reset-filters-btn"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.08 }}
                className="products-grid-layout"
              >
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onPreview={handlePreviewProduct}
                  />
                ))}
              </motion.div>

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
        </motion.div>
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
