import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ResetPasswordForm from './ResetPasswordForm'
import './AuthForms.css'

const AuthPage = () => {
  const [mode, setMode] = useState('login')
  const navigate = useNavigate()

  const handleAuthSuccess = () => {
    navigate('/')
  }

  const getAuthTitle = () => {
    switch (mode) {
      case 'register':
        return 'Новый кадр'
      case 'reset':
        return 'Вернуть доступ'
      case 'login':
      default:
        return 'Войти в зал'
    }
  }

  const getAuthSubtitle = () => {
    switch (mode) {
      case 'register':
        return 'Создай профиль, собирай фильмы, веди дневник и делай подборки.'
      case 'reset':
        return 'Восстанови пароль и возвращайся к своему киноархиву.'
      case 'login':
      default:
        return 'Продолжи свой личный кинодневник в стиле грязного золота и красных титров.'
    }
  }

  const renderForm = () => {
    switch (mode) {
      case 'register':
        return (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )
      case 'reset':
        return (
          <ResetPasswordForm
            onSwitchToLogin={() => setMode('login')}
          />
        )
      case 'login':
      default:
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={(newMode) => setMode(newMode)}
          />
        )
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__grain" />

      <div className="auth-shell">
        <section className="auth-hero" aria-label="Talk About">

          <h1 className="auth-hero__title">
            Frame 25
          </h1>

          <p className="auth-hero__subtitle">
            {getAuthSubtitle()}
          </p>

          <div className="auth-hero__divider" />

          <div className="auth-hero__quote">
            <span>Tonight’s feature</span>
            <strong>{getAuthTitle()}</strong>
          </div>
        </section>

        <div className="auth-wrapper">
          {renderForm()}
        </div>
      </div>
    </div>
  )
}

export default AuthPage