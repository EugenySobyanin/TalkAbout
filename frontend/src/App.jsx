// src/App.jsx

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Layout from './components/Layout/Layout'
import AuthPage from './components/Auth/AuthPage'

import HomePage from './pages/HomePage/HomePage'
import FilmPage from './pages/FilmPage/FilmPage'
import CompilationsPage from './pages/CompilationsPage/CompilationsPage'
import DiaryPage from './pages/DiaryPage/DiaryPage'
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage'
import FilmPickerPage from './pages/FilmPickerPage/FilmPickerPage'
import PickerResultsPage from './pages/PickerResultsPage/PickerResultsPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import UserProfilePage from './pages/UserProfilePage/UserProfilePage'
import SubscriptionsPage from './pages/SubscriptionsPage/SubscriptionsPage'
import FilmReviewsPage from './pages/FilmReviewsPage/FilmReviewsPage'

import './App.css'


const FeedPage = () => (
  <div className="page-container">
    <h1>Лента</h1>
  </div>
)

const RecommendationsPage = () => (
  <div className="page-container">
    <h1>Рекомендации</h1>
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    )
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />
}

const withLayout = (page) => (
  <Layout>
    {page}
  </Layout>
)

const withProtectedLayout = (page) => (
  <ProtectedRoute>
    <Layout>
      {page}
    </Layout>
  </ProtectedRoute>
)

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        <Route path="/" element={withProtectedLayout(<HomePage />)} />
        <Route path="/profile" element={withProtectedLayout(<ProfilePage />)} />
        <Route path="/diary" element={withProtectedLayout(<DiaryPage />)} />
        <Route path="/subscriptions" element={withProtectedLayout(<SubscriptionsPage />)} />
        <Route path="/feed" element={withProtectedLayout(<FeedPage />)} />
        <Route path="/compilations" element={withProtectedLayout(<CompilationsPage />)} />
        <Route path="/recommendations" element={withProtectedLayout(<RecommendationsPage />)} />

        <Route path="/film/:id" element={withLayout(<FilmPage />)} />
        <Route path="/film/:id/reviews" element={withLayout(<FilmReviewsPage />)} />
        <Route path="/films/search" element={withLayout(<SearchResultsPage />)} />
        <Route path="/films/picker" element={withLayout(<FilmPickerPage />)} />
        <Route path="/films/picker/results" element={withLayout(<PickerResultsPage />)} />
        <Route path="/users/:id" element={withLayout(<UserProfilePage />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AppContent />
      </div>
    </AuthProvider>
  )
}

export default App