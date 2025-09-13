import React, { useState } from 'react';
import { Search, Filter, MapPin, Grid } from 'lucide-react';

// Search and filter component for equipment discovery with category/location filters
const SearchBar = ({ onSearch, categories = [], locations = [] }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false); // Toggle filter panel

  // Update filters and trigger search callback
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  // Reset all filters to default state
  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      location: ''
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  // Check if any filters are currently active
  const hasActiveFilters = filters.category || filters.location;

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      {/* Main Search Bar */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        marginBottom: showFilters ? '20px' : '0'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            placeholder="Search equipment by name or model..."
            style={{
              width: '100%',
              padding: '12px 40px 12px 15px',
              border: '2px solid var(--gray-medium)',
              borderRadius: '25px',
              fontSize: '14px',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--gray-medium)'}
          />
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-dark)'
            }}
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '12px 20px',
            backgroundColor: showFilters ? 'var(--primary-green)' : 'var(--gray-light)',
            color: showFilters ? 'white' : 'var(--gray-dark)',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && (
            <span style={{
              backgroundColor: 'var(--accent-brown)',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {(filters.category ? 1 : 0) + (filters.location ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          paddingTop: '20px',
          borderTop: '1px solid var(--gray-medium)'
        }}>
          {/* Category Filter */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--gray-dark)'
            }}>
              <Grid size={16} />
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid var(--gray-medium)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--gray-dark)'
            }}>
              <MapPin size={16} />
              Location
            </label>
            <select
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid var(--gray-medium)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent-brown)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  width: '100%'
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div style={{
          marginTop: '15px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>
            Active filters:
          </span>
          {filters.category && (
            <span style={{
              backgroundColor: 'var(--primary-green)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {filters.category}
            </span>
          )}
          {filters.location && (
            <span style={{
              backgroundColor: 'var(--primary-green)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {filters.location}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
