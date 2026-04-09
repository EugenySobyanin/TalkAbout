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
    //{ path: '/random-film', label: 'Подбор фильма', icon: '🎲' },
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul className="menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar