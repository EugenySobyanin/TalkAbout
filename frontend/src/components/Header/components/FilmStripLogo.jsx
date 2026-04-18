import React from 'react'
import { Link } from 'react-router-dom'
import './FilmStripLogo.css'

const FilmStripLogo = () => {
  return (
    <Link to="/" className="filmstrip-logo-link" aria-label="Frame25">
      <span className="filmstrip-text">
        <span className="filmstrip-word">Frame</span>
        <span className="filmstrip-number">25</span>
      </span>
    </Link>
  )
}

export default FilmStripLogo