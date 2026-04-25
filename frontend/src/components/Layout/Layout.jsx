// src/components/Layout/Layout.jsx

import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <Sidebar />

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout