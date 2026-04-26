import React from 'react'
import FilmStripLogo from './components/FilmStripLogo'
import SearchBar from './components/SearchBar'
import UserMenu from './components/UserMenu'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <FilmStripLogo />
      </div>

      <div className="header-right">
        <div className="header-search">
          <SearchBar />
        </div>

        <UserMenu />
      </div>
    </header>
  )
}

export default Header