import api from "./config"

export const login = async (username, password) => {
    const response = await api.post(
        '/auth/token/login', 
        {username, password}
    )
    return response.data
}

export const logout = async () => {
    await api.post('/auth/token/logout/')
    localStorage.removeItem('auth_token')
}

export const register = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/users/me/')
  return response.data
}