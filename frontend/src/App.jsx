import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';

import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import DiaryPage from './pages/DiaryPage/DiaryPage';
import SubscriptionsPage from './pages/SubscriptionsPage/SubscriptionsPage';
import FeedPage from './pages/FeedPage/FeedPage';
import CompilationsPage from './pages/CompilationsPage/CompilationsPage';
import RecommendationsPage from './pages/RecommendationsPage/RecommendationsPage';
import RandomFilmPage from './pages/RandomFilmPage/RandomFilmPage';
import FilmPage from './pages/FilmPage/FilmPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/compilations" element={<CompilationsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/random-film" element={<RandomFilmPage />} />
            <Route path="/film/:id" element={<FilmPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
