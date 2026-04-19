import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import HomePage from './pages/HomePage/HomePage';
import FilmPage from './pages/FilmPage/FilmPage';
import CompilationsPage from './pages/CompilationsPage/CompilationsPage';
import DiaryPageComponent from './pages/DiaryPage/DiaryPage'; // ← Переименовываем импорт
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage';
import FilmPickerPage from './pages/FilmPickerPage/FilmPickerPage';
import PickerResultsPage from './pages/PickerResultsPage/PickerResultsPage';
import './App.css';


const ProfilePage = () => {
    return (
        <div className="page-container">
            <h1>Профиль</h1>
        </div>
    )
}


const SubscriptionsPage = () => {
    return (
        <div className="page-container">
            <h1>Подписки</h1>
        </div>
    )
}

const FeedPage = () => {
    return (
        <div className="page-container">
            <h1>Лента</h1>
        </div>
    )
}


const RecommendationsPage = () => {
    return (
        <div className="page-container">
            <h1>Рекомендации</h1>
        </div>
    )
}

// Защищенный маршрут
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Загрузка...</div>
            </div>
        )
    }
    
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Публичный маршрут (только для неавторизованных)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Загрузка...</div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Основной layout с Header и Sidebar
const MainLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <Header />
            <div className="content-wrapper">
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

const AppContent = () => {
    return (
        <Router>
            <Routes>
                {/* Публичные маршруты без Header и Sidebar */}
                <Route path="/login" element={
                    <PublicRoute>
                        <AuthPage />
                    </PublicRoute>
                } />
                
                {/* Защищенные маршруты с Header и Sidebar */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <HomePage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <ProfilePage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/diary" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <DiaryPageComponent /> {/* ← Используем переименованный компонент */}
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/subscriptions" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <SubscriptionsPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/feed" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <FeedPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/compilations" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <CompilationsPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/recommendations" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <RecommendationsPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                {/* Публичный маршрут с Header и Sidebar */}
                <Route path="/film/:id" element={
                    <MainLayout>
                        <FilmPage />
                    </MainLayout>
                } />
                
                {/* Редирект для неизвестных маршрутов */}
                <Route path="*" element={<Navigate to="/" replace />} />

                {/* Все результаты поиска фильма */}
                <Route path="/films/search" element={
                    <MainLayout>
                        <SearchResultsPage />
                    </MainLayout>
                } />

                {/*Страница с формой подбора фильмов*/}
                <Route path="/films/picker" element={
                    <MainLayout>
                        <FilmPickerPage />
                    </MainLayout>
                    
                } />

                {/*Страница с результатами подбора*/}
                <Route path="/films/picker/results" element={
                    <MainLayout>
                        <PickerResultsPage />
                    </MainLayout>
                } />

            </Routes>
        </Router>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App