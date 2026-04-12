import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './UserMenu.css';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (user) {
    return (
      <div className="user-menu">
        <Link to="/profile" className="user-profile-link">
          <img 
            src={user.avatar || '/default-avatar.png'} 
            alt={user.username}
            className="user-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
          <span className="user-username">{user.username}</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="logout-button"
          title="Выйти"
        >
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Выйти</span>
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLoginClick} 
      className="login-button"
    >
      <span className="login-icon">🔐</span>
      <span>Войти</span>
    </button>
  );
};

export default UserMenu;