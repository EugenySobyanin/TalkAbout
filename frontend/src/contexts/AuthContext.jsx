import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                authService.initAuth();
                const token = localStorage.getItem('auth_token');
                if (token) {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                localStorage.removeItem('auth_token');
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await authService.login(username, password);
            const userData = await authService.getCurrentUser();
            setUser(userData);
            return { success: true, data: response };
        } catch (err) {
            const errorMessage = err.response?.data?.non_field_errors?.[0] || 
                                err.response?.data?.detail || 
                                'Ошибка входа';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            await authService.register(userData);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.email?.[0] || 
                                err.response?.data?.username?.[0] || 
                                err.response?.data?.password?.[0] || 
                                'Ошибка регистрации';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
            // Даже если запрос не удался, очищаем локальные данные
            localStorage.removeItem('auth_token');
            setUser(null);
        }
    };

    const resetPassword = async (email) => {
        try {
            setError(null);
            await authService.resetPassword(email);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.email?.[0] || 'Ошибка отправки email';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const confirmResetPassword = async (uid, token, newPassword) => {
        try {
            setError(null);
            await authService.confirmResetPassword(uid, token, newPassword);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.new_password?.[0] || 
                                err.response?.data?.token?.[0] || 
                                'Ошибка сброса пароля';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        confirmResetPassword,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};