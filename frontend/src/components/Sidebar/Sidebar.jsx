import { NavLink } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const menuItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
    { path: '/diary', label: 'Дневник', icon: '📓' },
    { path: '/subscriptions', label: 'Подписки', icon: '🔔' },
    { path: '/feed', label: 'Лента', icon: '📰' },
    { path: '/compilations', label: 'Подборки', icon: '📚' },
    { path: '/recommendations', label: 'Рекомендации', icon: '⭐' },
  ]

  return (
    <aside className="sidebar">
      {/* <div className="sidebar-header">
        <span className="sidebar-title">МЕНЮ</span>
      </div> */}
      <nav>
        <ul className="menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                <span className="menu-arrow">▶</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="blood-splatter"></div>
        <div className="blood-splatter small"></div>
      </div>
    </aside>
  )
}

export default Sidebar