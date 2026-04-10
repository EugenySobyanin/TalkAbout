import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForms.css';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        // Валидация имени пользователя
        if (!formData.username.trim()) {
            newErrors.username = 'Введите имя пользователя';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Имя пользователя должно быть не менее 3 символов';
        } else if (!/^[\w.@+-]+$/.test(formData.username)) {
            newErrors.username = 'Имя пользователя может содержать только буквы, цифры и символы @/./+/-/_';
        }
        
        // Валидация email
        if (!formData.email) {
            newErrors.email = 'Введите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Введите корректный email';
        }
        
        // Валидация пароля
        if (!formData.password) {
            newErrors.password = 'Введите пароль';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Пароль должен быть не менее 8 символов';
        }
        
        // Подтверждение пароля
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
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
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            if (result.success) {
                setIsRegistered(true);
                onSuccess?.();
            } else {
                setApiError(result.error);
            }
        } catch (err) {
            setApiError('Произошла ошибка при регистрации. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isRegistered) {
        return (
            <div className="auth-form-container">
                <div className="success-message">
                    <h3>Регистрация успешна!</h3>
                    <p>На ваш email отправлено письмо для подтверждения аккаунта.</p>
                    <p>Пожалуйста, проверьте почту и перейдите по ссылке в письме.</p>
                    <button 
                        className="submit-button"
                        onClick={onSwitchToLogin}
                    >
                        Перейти к входу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-form-container">
            <h2>Регистрация</h2>
            
            <form onSubmit={handleSubmit} className="auth-form">
                {apiError && (
                    <div className="error-message">
                        {apiError}
                    </div>
                )}
                
                <div className="form-group">
                    <label htmlFor="username">Имя пользователя *</label>
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
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="email"
                    />
                    {errors.email && (
                        <span className="field-error">{errors.email}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Пароль *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                    {errors.password && (
                        <span className="field-error">{errors.password}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Подтвердите пароль *</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                        <span className="field-error">{errors.confirmPassword}</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>

                <div className="form-footer">
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={onSwitchToLogin}
                    >
                        Уже есть аккаунт? Войти
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;