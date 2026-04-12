import React from 'react'
import { Link } from 'react-router-dom'
import './FilmStripLogo.css'

const FilmStripLogo = () => {
  return (
    <Link to="/" className="filmstrip-logo-link">
      <div className="filmstrip-logo">
        <div className="filmstrip-body">
          {/* <div className="filmstrip-perforation top">
            <span></span><span></span><span></span><span></span><span></span>
          </div> */}
          <div className="filmstrip-content">
            <span className="filmstrip-icon">🎬</span>
          </div>
          {/* <div className="filmstrip-perforation bottom">
            <span></span><span></span><span></span><span></span><span></span>
          </div> */}
        </div>
        <span className="filmstrip-text">
          <span className="letter">F</span>
          <span className="letter">r</span>
          <span className="letter">a</span>
          <span className="letter">m</span>
          <span className="letter">e</span>
          <span className="letter">2</span>
          <span className="letter">5</span>
        </span>
      </div>
    </Link>
  )
}

export default FilmStripLogo