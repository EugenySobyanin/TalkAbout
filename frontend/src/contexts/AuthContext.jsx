import React, { createContext, useState, useContext, useEffect } from 'react'
import { getCurrentUser, login as loginApi, logout as logoutApi } from '../api/auth'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('auth_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const data = await loginApi(username, password)
    localStorage.setItem('auth_token', data.auth_token)
    const userData = await getCurrentUser()
    setUser(userData)
    return userData
  };

  const logout = async () => {
    await logoutApi()
    setUser(null)
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};