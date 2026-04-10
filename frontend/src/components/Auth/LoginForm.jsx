import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForms.css';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'Введите имя пользователя';
        }
        
        if (!formData.password) {
            newErrors.password = 'Введите пароль';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Пароль должен быть не менее 8 символов';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку поля при вводе
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setApiError('');

        try {
            const result = await login(formData.username, formData.password);
            
            if (result.success) {
                onSuccess?.();
            } else {
                setApiError(result.error);
            }
        } catch (err) {
            setApiError('Произошла ошибка при входе. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Вход в аккаунт</h2>
            
            <form onSubmit={handleSubmit} className="auth-form">
                {apiError && (
                    <div className="error-message">
                        {apiError}
                    </div>
                )}
                
                <div className="form-group">
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="username"
                    />
                    {errors.username && (
                        <span className="field-error">{errors.username}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Пароль</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                    {errors.password && (
                        <span className="field-error">{errors.password}</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>

                <div className="form-footer">
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={() => onSwitchToRegister?.('reset')}
                    >
                        Забыли пароль?
                    </button>
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={() => onSwitchToRegister?.('register')}
                    >
                        Создать аккаунт
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;