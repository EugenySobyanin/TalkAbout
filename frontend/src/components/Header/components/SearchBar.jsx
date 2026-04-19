import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchFilms } from '../../../api/films';
import SearchDropdown from './SearchDropdown';
import './SearchBar.css';

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalFound, setTotalFound] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  /*Для скрытия списка при клике в другую область */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const query = searchTerm.trim();

    // ❗ защита от мусорных запросов
    if (query.length < 2) {
      setSearchResults([]);
      setTotalFound(0);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const data = await searchFilms(query);

        setSearchResults(data.results || []);
        setTotalFound(data.total || 0);
        setShowDropdown(true);
      } catch (error) {
        console.error('Ошибка поиска:', error);
        setSearchResults([]);
        setTotalFound(0);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleFilmSelect = (filmId) => {
    navigate(`/film/${filmId}`);
    setSearchTerm('');
    setShowDropdown(false);
    setSearchResults([]);
    setIsFocused(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  const handleShowAll = () => {
  const query = searchTerm.trim();
  if (!query) return;

  navigate(`/films/search?q=${encodeURIComponent(query)}`);

  setShowDropdown(false);
  setIsFocused(false);
  };

  return (
    <div className="search-bar-container" ref={dropdownRef}>
      <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Поиск фильмов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input"
        />
        {isSearching && (
          <span className="search-spinner">⟳</span>
        )}
        {searchTerm && !isSearching && (
          <button 
            className="clear-search-btn"
            onClick={handleClearSearch}
            aria-label="Очистить поиск"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <SearchDropdown 
          results={searchResults}
          total={totalFound}
          onSelect={handleFilmSelect}
          onShowAll={handleShowAll}
          searchTerm={searchTerm}
          isSearching={isSearching}
        />
      )}
    </div>
  );
};

export default SearchBar;