import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import DiaryPage from './pages/DiaryPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import FeedPage from './pages/FeedPage';
import CompilationsPage from './pages/CompilationsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import RandomFilmPage from './pages/RandomFilmPage';

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
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
