import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="sidebar-search-box-wrapper">
      <Search size={16} className="sidebar-search-icon-svg" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sidebar-search-input-field"
      />
    </div>
  );
};

export default SearchBar;
