import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import './UserMenu.css'

const getDisplayName = (user) => {
  if (!user) return ''

  const fullName = user.full_name?.trim()

  if (fullName) return fullName

  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  const name = `${firstName} ${lastName}`.trim()

  return name || user.username || 'Пользователь'
}

const UserMenu = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/login')
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleLoginClick}
        className="login-button"
      >
        <span className="login-icon">🔐</span>
        <span>Войти</span>
      </button>
    )
  }

  const displayName = getDisplayName(user)

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className={`user-menu-trigger ${isOpen ? 'user-menu-trigger--open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="user-menu-name">
          {displayName}
        </span>

        <span className="user-menu-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown" role="menu">
          <Link
            to="/profile"
            className="user-menu-dropdown__item"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Профиль
          </Link>

          <button
            type="button"
            className="user-menu-dropdown__item user-menu-dropdown__item--danger"
            onClick={handleLogout}
            role="menuitem"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu