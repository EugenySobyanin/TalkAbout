import api from "./config"

export const initAuth = () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
        api.defaults.headers.common['Authorization'] = `Token ${token}`
    }
}

export const login = async (username, password) => {
    const response = await api.post('/auth/token/login/', { username, password })
    const token = response.data?.auth_token
    if (token) {
        localStorage.setItem('auth_token', token)
        api.defaults.headers.common['Authorization'] = `Token ${token}`
    }
    return response.data
}

export const logout = async () => {
    try {
        await api.post('/auth/token/logout/')
    } catch (err) {
        console.error('Logout error:', err)
    } finally {
        localStorage.removeItem('auth_token')
        delete api.defaults.headers.common['Authorization']
    }
}

export const register = async ({ username, password, email }) => {
    const response = await api.post('/users/', { username, password, email })
    return response.data
}

export const getCurrentUser = async () => {
    const response = await api.get('/users/me/')
    return response.data
}

export const resetPassword = async (email) => {
    const response = await api.post('/users/reset_password/', { email })
    return response.data
}

export const confirmResetPassword = async (uid, token, new_password) => {
    const response = await api.post('/users/reset_password_confirm/', { 
        uid, 
        token, 
        new_password 
    })
    return response.data
}

export const isAuthenticated = () => {
    return !!localStorage.getItem('auth_token')
}