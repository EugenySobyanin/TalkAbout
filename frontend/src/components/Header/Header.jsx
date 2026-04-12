import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { searchFilms } from '../../api/films'
import './Header.css'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Поиск фильмов с debounce
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setIsSearching(true)
      const delayDebounce = setTimeout(async () => {
        try {
          const data = await searchFilms(searchTerm)
          setSearchResults(data)
          setShowDropdown(true)
        } catch (error) {
          console.error('Ошибка поиска:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
      return () => clearTimeout(delayDebounce)
    } else {
      setSearchResults([])
      setShowDropdown(false)
      setIsSearching(false)
    }
  }, [searchTerm])

  // Обработчик выбора фильма
  const handleFilmSelect = (filmId) => {
    navigate(`/film/${filmId}`)
    setSearchTerm('')
    setShowDropdown(false)
    setSearchResults([])
  }

  // Обработчик выхода
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Обработчик перехода на страницу входа
  const handleLoginClick = () => {
    navigate('/login')
  }

  // Очистка поиска
  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setShowDropdown(false)
    searchInputRef.current?.focus()
  }

  // Форматирование длительности
  const formatDuration = (minutes) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}мин`
    }
    return `${mins}мин`
  }

  // Обработка нажатия клавиш в поиске
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch()
    }
  }

  return (
    <header className="header">
      <div className="header-left">
      <Link to="/" className="logo-link">
        <div className="film-strip-logo">
          <div className="film-strip">
            <span className="film-hole"></span>
            <span className="film-hole"></span>
            <span className="film-hole"></span>
            <span className="film-hole"></span>
          </div>
          <div className="film-frame">
            <span className="frame-icon">🎬</span>
          </div>
        </div>
      </Link>
      <Link to="/" className="app-name-link">
        <span className="app-name">
          <span className="letter">F</span>
          <span className="letter">r</span>
          <span className="letter">a</span>
          <span className="letter">m</span>
          <span className="letter">e</span>
          <span className="letter">2</span>
          <span className="letter">5</span>
        </span>
      </Link>
    </div>

      <div className="search-container" ref={dropdownRef}>
        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск фильмов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
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

        {showDropdown && searchResults.length > 0 && (
          <div className="search-dropdown">
            <div className="search-results-header">
              <span>Найдено: {searchResults.length}</span>
            </div>
            <div className="search-results-list">
              {searchResults.map((film) => (
                <div
                  key={film.id}
                  className="search-item"
                  onClick={() => handleFilmSelect(film.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleFilmSelect(film.id)
                    }
                  }}
                >
                  {/* Постер фильма */}
                  <div className="search-item-poster">
                    {film.poster ? (
                      <img 
                        src={film.poster} 
                        alt={film.name || film.alternative_name || 'Постер фильма'}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/placeholder-poster.jpg'
                        }}
                      />
                    ) : (
                      <div className="no-poster">🎬</div>
                    )}
                  </div>
                  
                  {/* Информация о фильме */}
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
                    
                    {/* Краткое описание */}
                    {film.short_description && (
                      <div className="search-item-description">
                        {film.short_description.length > 120 
                          ? film.short_description.substring(0, 120) + '...' 
                          : film.short_description}
                      </div>
                    )}
                    
                    {/* Рейтинги */}
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
        )}

        {showDropdown && searchTerm && searchResults.length === 0 && !isSearching && (
          <div className="search-dropdown empty">
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <p>Ничего не найдено</p>
              <p className="no-results-hint">Попробуйте изменить запрос</p>
            </div>
          </div>
        )}
      </div>

      <div className="header-right">
        {user ? (
          <div className="user-info">
            <Link to="/profile" className="user-profile-link">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.username}
                className="avatar"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = '/default-avatar.png'
                }}
              />
              <span className="username">{user.username}</span>
            </Link>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              title="Выйти"
            >
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Выйти</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLoginClick} 
            className="login-btn"
          >
            <span className="login-icon">🔐</span>
            <span>Войти</span>
          </button>
        )}
      </div>
    </header>
  )
}

export default Header