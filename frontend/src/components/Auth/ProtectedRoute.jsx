import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, fallback = null }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Загрузка...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback;
    }

    return children;
};

export default ProtectedRoute;