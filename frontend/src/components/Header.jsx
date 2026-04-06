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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
                <span>{film.name || film.alternative_name}</span>
                <span className="film-year">{film.year}</span>
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
            <span>{user.username}</span>
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