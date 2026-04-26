// src/components/Sidebar/Sidebar.jsx

import { NavLink } from 'react-router-dom'
import { ChevronRightRounded } from '@mui/icons-material'
import './Sidebar.css'

function Sidebar() {
  const menuItems = [
    {
      path: '/',
      label: 'Главная',
      end: true,
    },
    {
      path: '/profile',
      label: 'Профиль',
    },
    {
      path: '/diary',
      label: 'Дневник',
    },
    {
      path: '/films/picker',
      label: 'Подбор',
    },
    {
      path: '/subscriptions',
      label: 'Подписки',
    },
    {
      path: '/feed',
      label: 'Лента',
    },
    {
      path: '/compilations',
      label: 'Подборки',
    },
    {
      path: '/recommendations',
      label: 'Рекомендации',
    },
  ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Основное меню">
        <ul className="menu">
          {menuItems.map(({ path, label, end }) => (
            <li key={path} className="menu-item">
              <NavLink
                to={path}
                end={end}
                className={({ isActive }) =>
                  isActive ? 'menu-link active' : 'menu-link'
                }
              >
                <span className="menu-label">
                  {label}
                </span>

                <span className="menu-arrow" aria-hidden="true">
                  <ChevronRightRounded fontSize="inherit" />
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar