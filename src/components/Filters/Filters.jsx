import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Star, ChevronDown, ChevronRight } from 'lucide-react';
import SearchBar from '../SearchBar/SearchBar';
import { categoryService } from '../../services/categoryService';
import './Filters.css';

const Filters = ({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  selectedBrands,
  setSelectedBrands,
  selectedRating,
  setSelectedRating,
  inStockOnly,
  setInStockOnly,
  availableBrands = [],
  onReset,
  products = [],
  selectedGenders = [],
  setSelectedGenders
}) => {
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({
    'Fashion': true,
    'Fashion > Clothing': true,
    'Fashion > Footwear': true,
    'Fashion > Eyewear': true,
    'Fashion > Bags': true,
    'Fashion > Watches': true
  });

  // 1. Fetch categories hierarchical tree from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res && res.categories) {
          setCategoriesTree(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories tree in Filters:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Auto-expand category tree nodes when selectedGenders changes
  useEffect(() => {
    if (selectedGenders.length === 0) return;

    setExpandedNodes(prev => {
      const nextExpanded = { ...prev };
      
      const traverseAndExpand = (node) => {
        let hasMatchingChild = false;
        
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            if (selectedGenders.includes(child.name)) {
              hasMatchingChild = true;
            }
            if (traverseAndExpand(child)) {
              hasMatchingChild = true;
            }
          });
        }
        
        if (hasMatchingChild) {
          nextExpanded[node.path] = true;
        }
        return hasMatchingChild;
      };

      categoriesTree.forEach(root => traverseAndExpand(root));
      return nextExpanded;
    });
  }, [selectedGenders, categoriesTree]);

  const toggleExpand = (path, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // 2. Count products belonging to this category/subcategory path dynamically based on active filters
  const getProductCount = (path) => {
    if (!products || products.length === 0) return 0;

    return products.filter(p => {
      // 1. Gender Match
      const isGenderSpecific = p.category === 'Fashion';
      
      let matchesGender = true;
      if (selectedGenders.length > 0) {
        if (isGenderSpecific) {
          matchesGender = p.gender && selectedGenders.includes(p.gender);
        } else {
          matchesGender = true;
        }
      }
      if (!matchesGender) return false;

      // 2. Brand Match
      const matchesBrand = selectedBrands.length === 0 ||
        selectedBrands.includes(p.brand);
      if (!matchesBrand) return false;

      // 3. Rating Match
      const matchesRating = p.rating >= selectedRating;
      if (!matchesRating) return false;

      // 4. Availability Match
      const matchesAvailability = !inStockOnly || p.stock > 0;
      if (!matchesAvailability) return false;

      // 5. Price Match
      const finalPrice = p.price * (1 - (p.discountPercentage || 0) / 100);
      const matchesPrice = finalPrice <= priceRange;
      if (!matchesPrice) return false;

      // 6. Search Match
      const matchesSearch = searchQuery.trim() === '' || 
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Construct full category path for the product
      let prodPath = p.category || '';
      if (p.subCategory) prodPath += ` > ${p.subCategory}`;
      if (p.gender) prodPath += ` > ${p.gender}`;
      if (p.productType) prodPath += ` > ${p.productType}`;

      // Check if prodPath matches exactly or starts with this path
      return prodPath === path || prodPath.startsWith(path + ' > ');
    }).length;
  };

  const handleCategoryCheckboxChange = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else {
        setExpandedNodes(exp => ({ ...exp, [cat]: true }));
        return [...prev, cat];
      }
    });
  };

  const handleGenderCheckboxChange = (gender) => {
    setSelectedGenders(prev => {
      if (prev.includes(gender)) {
        return prev.filter(g => g !== gender);
      } else {
        return [...prev, gender];
      }
    });
  };

  const handleBrandCheckboxChange = (brand) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };

  // Dynamically scale price slider max based on items
  const maxPriceVal = products.length > 0 ? Math.max(...products.map(p => p.price), 15000) : 15000;

  // Recursive rendering of Categories tree node
  const renderTreeNode = (node, depth = 0) => {
    const isChecked = selectedCategories.includes(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.path];
    const count = getProductCount(node.path);

    return (
      <div key={node.path} className="tree-node-wrapper" style={{ paddingLeft: depth > 0 ? '12px' : '0' }}>
        <div className={`tree-node-row ${isChecked ? 'selected-node' : ''}`}>
          {hasChildren && (
            <button 
              type="button"
              className="tree-expand-btn" 
              onClick={(e) => toggleExpand(node.path, e)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {!hasChildren && <span className="tree-leaf-spacer"></span>}
          
          <label className="category-checkbox-label tree-checkbox-label">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCategoryCheckboxChange(node.path)}
              className="category-checkbox-input"
            />
            <span className="custom-checkbox"></span>
            <span className="checkbox-text">
              {node.name} <span className="node-count-badge">({count})</span>
            </span>
          </label>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-node-children-container">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="filters-sidebar glass-effect">
      <div className="sidebar-header">
        <SlidersHorizontal size={18} className="filter-header-icon" />
        <h2>Filters</h2>
      </div>

      {/* 1. Keyword search */}
      <div className="filter-group">
        <h3>Search in Catalog</h3>
        <SearchBar 
          value={searchQuery} 
          onChange={(val) => setSearchQuery(val)} 
          placeholder="Type keywords..." 
        />
      </div>

      {/* 2. Hierarchical Categories tree */}
      <div className="filter-group">
        <h3>Categories</h3>
        <div className="categories-tree-scroll-container">
          {categoriesTree.map(root => renderTreeNode(root, 0))}
        </div>
      </div>

      {/* 3. Gender checklist */}
      <div className="filter-group">
        <h3>Gender</h3>
        <div className="gender-checkbox-list">
          {['Men', 'Women', 'Kids'].map(gender => {
            const isChecked = selectedGenders.includes(gender);
            return (
              <label key={gender} className="category-checkbox-label">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleGenderCheckboxChange(gender)}
                  className="category-checkbox-input"
                />
                <span className="custom-checkbox"></span>
                <span className="checkbox-text">{gender}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Brand checklist */}
      {availableBrands.length > 0 && (
        <div className="filter-group">
          <h3>Brands</h3>
          <div className="brands-checkbox-list">
            {availableBrands.slice(0, 15).map(brand => {
              const isChecked = selectedBrands.includes(brand);
              return (
                <label key={brand} className="category-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandCheckboxChange(brand)}
                    className="category-checkbox-input"
                  />
                  <span className="custom-checkbox"></span>
                  <span className="checkbox-text">{brand}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Price range slider */}
      <div className="filter-group">
        <h3>Price Range</h3>
        <div className="price-slider-wrapper">
          <input 
            type="range" 
            min="0" 
            max={maxPriceVal} 
            value={priceRange} 
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="price-range-slider"
          />
          <div className="price-range-values">
            <span>₹0</span>
            <span className="price-range-current">Up to ₹{priceRange.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 6. Rating selection */}
      <div className="filter-group">
        <h3>Rating Threshold</h3>
        <div className="ratings-filter-options">
          {[4, 3, 2].map(stars => (
            <label key={stars} className="rating-filter-row">
              <input
                type="radio"
                name="ratingThreshold"
                checked={selectedRating === stars}
                onChange={() => setSelectedRating(stars)}
                className="rating-radio-input"
              />
              <span className="custom-radio"></span>
              <div className="rating-stars-label">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    fill={i < stars ? '#f59e0b' : 'none'} 
                    stroke="#f59e0b" 
                  />
                ))}
                <span className="stars-txt">& Up</span>
              </div>
            </label>
          ))}
          <label className="rating-filter-row">
            <input
              type="radio"
              name="ratingThreshold"
              checked={selectedRating === 0}
              onChange={() => setSelectedRating(0)}
              className="rating-radio-input"
            />
            <span className="custom-radio"></span>
            <span className="checkbox-text">All Ratings</span>
          </label>
        </div>
      </div>

      {/* 7. Availability */}
      <div className="filter-group">
        <h3>Availability</h3>
        <div className="availability-checkbox-wrapper">
          <label className="category-checkbox-label">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="category-checkbox-input"
            />
            <span className="custom-checkbox"></span>
            <span className="checkbox-text">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Reset Filters button */}
      <button onClick={onReset} className="sidebar-reset-btn">
        Reset All Filters
      </button>
    </aside>
  );
};

export default Filters;
