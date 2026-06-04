import React, { useState } from 'react';
import { SlidersHorizontal, Star, ChevronDown, ChevronRight } from 'lucide-react';
import SearchBar from '../SearchBar/SearchBar';
import './Filters.css';

// Define the full Fashion categories hierarchy tree
const FASHION_TREE = {
  name: 'Fashion',
  path: 'Fashion',
  children: [
    {
      name: 'Clothing',
      path: 'Fashion > Clothing',
      children: [
        {
          name: 'Men',
          path: 'Fashion > Clothing > Men',
          children: [
            { name: 'T-Shirts', path: 'Fashion > Clothing > Men > T-Shirt' },
            { name: 'Shirts', path: 'Fashion > Clothing > Men > Shirt' },
            { name: 'Jeans', path: 'Fashion > Clothing > Men > Jeans' },
            { name: 'Trousers', path: 'Fashion > Clothing > Men > Trousers' },
            { name: 'Jackets', path: 'Fashion > Clothing > Men > Jacket' },
            { name: 'Hoodies', path: 'Fashion > Clothing > Men > Hoodie' }
          ]
        },
        {
          name: 'Women',
          path: 'Fashion > Clothing > Women',
          children: [
            { name: 'Sarees', path: 'Fashion > Clothing > Women > Saree' },
            { name: 'Kurtis', path: 'Fashion > Clothing > Women > Kurti' },
            { name: 'Dresses', path: 'Fashion > Clothing > Women > Dress' },
            { name: 'Tops', path: 'Fashion > Clothing > Women > Top' },
            { name: 'Jeans', path: 'Fashion > Clothing > Women > Jeans' },
            { name: 'Jackets', path: 'Fashion > Clothing > Women > Jacket' }
          ]
        },
        {
          name: 'Kids',
          path: 'Fashion > Clothing > Kids',
          children: [
            { name: 'Boys Wear', path: 'Fashion > Clothing > Kids > Boys Wear' },
            { name: 'Girls Wear', path: 'Fashion > Clothing > Kids > Girls Wear' },
            { name: 'School Uniforms', path: 'Fashion > Clothing > Kids > School Uniform' },
            { name: 'Party Wear', path: 'Fashion > Clothing > Kids > Party Wear' }
          ]
        }
      ]
    },
    {
      name: 'Footwear',
      path: 'Fashion > Footwear',
      children: [
        {
          name: 'Men',
          path: 'Fashion > Footwear > Men',
          children: [
            { name: 'Sports Shoes', path: 'Fashion > Footwear > Men > Sports Shoes' },
            { name: 'Sneakers', path: 'Fashion > Footwear > Men > Sneakers' },
            { name: 'Formal Shoes', path: 'Fashion > Footwear > Men > Formal Shoes' },
            { name: 'Sandals', path: 'Fashion > Footwear > Men > Sandals' }
          ]
        },
        {
          name: 'Women',
          path: 'Fashion > Footwear > Women',
          children: [
            { name: 'Heels', path: 'Fashion > Footwear > Women > Heels' },
            { name: 'Flats', path: 'Fashion > Footwear > Women > Flats' },
            { name: 'Sneakers', path: 'Fashion > Footwear > Women > Sneakers' },
            { name: 'Sandals', path: 'Fashion > Footwear > Women > Sandals' }
          ]
        },
        {
          name: 'Kids',
          path: 'Fashion > Footwear > Kids',
          children: [
            { name: 'School Shoes', path: 'Fashion > Footwear > Kids > School Shoes' },
            { name: 'Casual Shoes', path: 'Fashion > Footwear > Kids > Casual Shoes' },
            { name: 'Sports Shoes', path: 'Fashion > Footwear > Kids > Sports Shoes' }
          ]
        }
      ]
    },
    {
      name: 'Eyewear',
      path: 'Fashion > Eyewear',
      children: [
        {
          name: 'Men',
          path: 'Fashion > Eyewear > Men',
          children: [
            { name: 'Sunglasses', path: 'Fashion > Eyewear > Men > Sunglasses' },
            { name: 'Reading Glasses', path: 'Fashion > Eyewear > Men > Reading Glasses' },
            { name: 'Computer Glasses', path: 'Fashion > Eyewear > Men > Computer Glasses' }
          ]
        },
        {
          name: 'Women',
          path: 'Fashion > Eyewear > Women',
          children: [
            { name: 'Sunglasses', path: 'Fashion > Eyewear > Women > Sunglasses' },
            { name: 'Fashion Glasses', path: 'Fashion > Eyewear > Women > Fashion Glasses' },
            { name: 'Reading Glasses', path: 'Fashion > Eyewear > Women > Reading Glasses' }
          ]
        },
        {
          name: 'Kids',
          path: 'Fashion > Eyewear > Kids',
          children: [
            { name: 'Sunglasses', path: 'Fashion > Eyewear > Kids > Sunglasses' },
            { name: 'Protective Glasses', path: 'Fashion > Eyewear > Kids > Protective Glasses' }
          ]
        }
      ]
    },
    {
      name: 'Bags',
      path: 'Fashion > Bags',
      children: [
        { name: 'Men', path: 'Fashion > Bags > Men' },
        { name: 'Women', path: 'Fashion > Bags > Women' },
        { name: 'Kids', path: 'Fashion > Bags > Kids' }
      ]
    },
    {
      name: 'Watches',
      path: 'Fashion > Watches',
      children: [
        { name: 'Men', path: 'Fashion > Watches > Men' },
        { name: 'Women', path: 'Fashion > Watches > Women' },
        { name: 'Kids', path: 'Fashion > Watches > Kids' }
      ]
    },
    {
      name: 'Accessories',
      path: 'Fashion > Accessories',
      children: [
        { name: 'Belts', path: 'Fashion > Accessories > Belt' },
        { name: 'Caps', path: 'Fashion > Accessories > Cap' },
        { name: 'Wallets', path: 'Fashion > Accessories > Wallet' },
        { name: 'Jewellery', path: 'Fashion > Accessories > Jewellery' },
        { name: 'Hair Accessories', path: 'Fashion > Accessories > Hair Accessories' },
        { name: 'Scarves', path: 'Fashion > Accessories > Scarf' }
      ]
    }
  ]
};

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
  const nonFashionCategories = [
    'Electronics',
    'Groceries',
    'Home & Kitchen',
    'Beauty',
    'Toys',
    'Books',
    'Sports'
  ];

  // Keep track of expanded state for hierarchical tree nodes
  const [expandedNodes, setExpandedNodes] = useState({ 'Fashion': true });

  const toggleExpand = (path, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const getProductCount = (path) => {
    if (!products || products.length === 0) return 0;

    if (nonFashionCategories.includes(path)) {
      return products.filter(p => p.category === path).length;
    }

    if (path === 'Fashion') {
      return products.filter(p => p.category === 'Fashion').length;
    }

    if (path.startsWith('Fashion > ')) {
      const parts = path.split(' > ');
      return products.filter(p => {
        if (p.category !== 'Fashion') return false;
        if (parts[1] && p.subCategory !== parts[1]) return false;
        if (parts[2] && p.gender !== parts[2]) return false;
        if (parts[3] && p.productType !== parts[3]) return false;
        return true;
      }).length;
    }

    return 0;
  };

  const handleCategoryCheckboxChange = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else {
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

  // Recursive rendering of Fashion Categories tree node
  const renderTreeNode = (node, depth = 0) => {
    const isChecked = selectedCategories.includes(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.path];
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
          {/* Flat categories */}
          {nonFashionCategories.map(cat => {
            const isChecked = selectedCategories.includes(cat);
            const count = getProductCount(cat);
            return (
              <label key={cat} className="category-checkbox-label flat-category-label">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryCheckboxChange(cat)}
                  className="category-checkbox-input"
                />
                <span className="custom-checkbox"></span>
                <span className="checkbox-text">
                  {cat} <span className="node-count-badge">({count})</span>
                </span>
              </label>
            );
          })}

          {/* Recursive Fashion Category Tree */}
          <div className="fashion-tree-root-box">
            {renderTreeNode(FASHION_TREE, 0)}
          </div>
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
