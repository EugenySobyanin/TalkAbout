import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForms.css';

const ResetPasswordForm = ({ onSwitchToLogin }) => {
    const { resetPassword, confirmResetPassword } = useAuth();
    const [step, setStep] = useState(1); // 1: email form, 2: confirmation form
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        uid: '',
        token: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const validateEmail = () => {
        const newErrors = {};
        
        if (!email) {
            newErrors.email = 'Введите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Введите корректный email';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateConfirmForm = () => {
        const newErrors = {};
        
        if (!formData.uid) {
            newErrors.uid = 'Введите UID';
        }
        
        if (!formData.token) {
            newErrors.token = 'Введите токен';
        }
        
        if (!formData.newPassword) {
            newErrors.newPassword = 'Введите новый пароль';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Пароль должен быть не менее 8 символов';
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateEmail()) {
            return;
        }

        setIsLoading(true);
        setApiError('');
        setSuccessMessage('');

        try {
            const result = await resetPassword(email);
            
            if (result.success) {
                setSuccessMessage('Инструкции по сбросу пароля отправлены на ваш email.');
                setStep(2);
            } else {
                setApiError(result.error);
            }
        } catch (err) {
            setApiError('Произошла ошибка. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateConfirmForm()) {
            return;
        }

        setIsLoading(true);
        setApiError('');
        setSuccessMessage('');

        try {
            const result = await confirmResetPassword(
                formData.uid,
                formData.token,
                formData.newPassword
            );
            
            if (result.success) {
                setSuccessMessage('Пароль успешно изменен!');
                setTimeout(() => {
                    onSwitchToLogin();
                }, 2000);
            } else {
                setApiError(result.error);
            }
        } catch (err) {
            setApiError('Произошла ошибка. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (step === 1) {
            setEmail(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setApiError('');
    };

    if (step === 1) {
        return (
            <div className="auth-form-container">
                <h2>Сброс пароля</h2>
                
                <form onSubmit={handleEmailSubmit} className="auth-form">
                    {apiError && (
                        <div className="error-message">
                            {apiError}
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className="success-message">
                            {successMessage}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            disabled={isLoading}
                            placeholder="Введите ваш email"
                        />
                        {errors.email && (
                            <span className="field-error">{errors.email}</span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Отправка...' : 'Отправить инструкции'}
                    </button>

                    <div className="form-footer">
                        <button 
                            type="button" 
                            className="link-button"
                            onClick={onSwitchToLogin}
                        >
                            Вернуться к входу
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="auth-form-container">
            <h2>Подтверждение сброса пароля</h2>
            
            <form onSubmit={handleConfirmSubmit} className="auth-form">
                {apiError && (
                    <div className="error-message">
                        {apiError}
                    </div>
                )}
                
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}
                
                <div className="form-group">
                    <label htmlFor="uid">UID (из письма)</label>
                    <input
                        type="text"
                        id="uid"
                        name="uid"
                        value={formData.uid}
                        onChange={handleChange}
                        className={errors.uid ? 'error' : ''}
                        disabled={isLoading}
                        placeholder="Введите UID из письма"
                    />
                    {errors.uid && (
                        <span className="field-error">{errors.uid}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="token">Токен (из письма)</label>
                    <input
                        type="text"
                        id="token"
                        name="token"
                        value={formData.token}
                        onChange={handleChange}
                        className={errors.token ? 'error' : ''}
                        disabled={isLoading}
                        placeholder="Введите токен из письма"
                    />
                    {errors.token && (
                        <span className="field-error">{errors.token}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="newPassword">Новый пароль</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={errors.newPassword ? 'error' : ''}
                        disabled={isLoading}
                    />
                    {errors.newPassword && (
                        <span className="field-error">{errors.newPassword}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Подтвердите пароль</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        disabled={isLoading}
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
                    {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                </button>

                <div className="form-footer">
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={() => setStep(1)}
                    >
                        Назад к вводу email
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordForm;