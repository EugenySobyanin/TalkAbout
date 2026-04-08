import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { searchFilms } from '../api/films'
import './Header.css'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    console.log('Search term changed:', searchTerm)

    if (searchTerm.length > 0) {
      const delayDebounce = setTimeout(() => {
        searchFilms(searchTerm).then(data => {
          setSearchResults(data)
          setShowDropdown(true)
        })
      }, 300)
      return () => clearTimeout(delayDebounce)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [searchTerm])

  const handleFilmSelect = (filmId) => {
    navigate(`/film/${filmId}/`)
    setSearchTerm('')
    setShowDropdown(false)
  }

  const formatDuration = (minutes) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}мин`
    }
    return `${mins}мин`
  }

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Logo" className="logo-img" />
        </Link>
        <span className="app-name">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>TalkAbout
        </span>
      </div>

      <div className="search-container" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Поиск фильмов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((film) => (
              <div
                key={film.id}
                className="search-item"
                onClick={() => handleFilmSelect(film.id)}
              >
                {/* Постер фильма */}
                <div className="search-item-poster">
                  {film.poster ? (
                    <img 
                      src={film.poster} 
                      alt={film.name || film.alternative_name}
                      onError={(e) => {
                        e.target.src = '/placeholder-poster.jpg'
                      }}
                    />
                  ) : (
                    <div className="no-poster">📽️</div>
                  )}
                </div>
                
                {/* Информация о фильме */}
                <div className="search-item-info">
                  <div className="search-item-header">
                    <div className="search-item-title">
                      {film.name || film.alternative_name || 'Без названия'}
                      {film.en_name && film.en_name !== film.name && film.en_name !== film.alternative_name && (
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
                        🎬kp {film.kinopoisk_rating.toFixed(1)}
                      </span>
                    )}
                    {film.imdb_rating && (
                      <span className="rating imdb" title="Рейтинг IMDb">
                        ⭐imdb {film.imdb_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="header-right">
        {user ? (
          <div className="user-info">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.username}
              className="avatar"
            />
            <span className="username">{user.username}</span>
            <button onClick={logout} className="logout-btn">Выйти</button>
          </div>
        ) : (
          <Link to="/login" className="login-link">Войти</Link>
        )}
      </div>
    </header>
  )
}

export default Header