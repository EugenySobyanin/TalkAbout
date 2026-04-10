import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetPasswordForm from './ResetPasswordForm';
import './AuthForms.css';

const AuthPage = () => {
    const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
    const navigate = useNavigate();

    const handleAuthSuccess = () => {
        navigate('/'); // Перенаправляем на главную после успешной аутентификации
    };

    const renderForm = () => {
        switch (mode) {
            case 'register':
                return (
                    <RegisterForm 
                        onSuccess={handleAuthSuccess}
                        onSwitchToLogin={() => setMode('login')}
                    />
                );
            case 'reset':
                return (
                    <ResetPasswordForm 
                        onSwitchToLogin={() => setMode('login')}
                    />
                );
            case 'login':
            default:
                return (
                    <LoginForm 
                        onSuccess={handleAuthSuccess}
                        onSwitchToRegister={(newMode) => setMode(newMode)}
                    />
                );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                {renderForm()}
            </div>
        </div>
    );
};

export default AuthPage;