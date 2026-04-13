import React from 'react';
import './SearchDropdown.css';

const SearchDropdown = ({ results, onSelect, searchTerm, isSearching }) => {
  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}мин`;
    }
    return `${mins}мин`;
  };

  if (searchTerm && results.length === 0 && !isSearching) {
    return (
      <div className="search-dropdown empty">
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <p>Ничего не найдено</p>
          <p className="no-results-hint">Попробуйте изменить запрос</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="search-dropdown">
      <div className="search-results-header">
        <span>Найдено: {results.length}</span>
      </div>
      <div className="search-results-list">
        {results.map((film) => (
          <div
            key={film.id}
            className="search-item"
            onClick={() => onSelect(film.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(film.id);
              }
            }}
          >
            <div className="search-item-poster">
              {film.poster_url ? (
                <img 
                  src={film.poster_url} 
                  alt={film.name || 'Постер фильма'}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-poster.jpg';
                  }}
                />
              ) : (
                <div className="no-poster">🎬</div>
              )}
            </div>
            
            <div className="search-item-info">
              <div className="search-item-header">
                <div className="search-item-title">
                  {film.name || film.alternative_name || film.en_name || 'Без названия'}
                  {film.en_name && 
                   film.en_name !== film.name && 
                   film.en_name !== film.alternative_name && (
                    <span className="search-item-en-name"> ({film.en_name})</span>
                  )}
                </div>
                
                <div className="search-item-meta">
                  <span className="search-item-year">
                    {film.year || 'Год неизвестен'}
                  </span>
                  {film.movie_length && (
                    <>
                      <span className="meta-separator">•</span>
                      <span className="search-item-duration">
                        🕐 {formatDuration(film.movie_length)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {film.short_description && (
                <div className="search-item-description">
                  {film.short_description.length > 150 
                    ? film.short_description.substring(0, 150) + '...' 
                    : film.short_description}
                </div>
              )}
              
              <div className="search-item-ratings">
                {film.rating && (
                  <span className="rating user-rating" title="Рейтинг пользователей">
                    👥 {film.rating}
                  </span>
                )}
                {film.kinopoisk_rating && (
                  <span className="rating kp" title="Рейтинг Кинопоиска">
                    🎬 {film.kinopoisk_rating.toFixed(1)}
                  </span>
                )}
                {film.imdb_rating && (
                  <span className="rating imdb" title="Рейтинг IMDb">
                    ⭐ {film.imdb_rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchDropdown;