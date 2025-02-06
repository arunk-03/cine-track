import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import AboutPage from './Pages/AboutPage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import DiscoverPage from './Pages/DiscoverPage';
import { ToastProvider } from './Components/Toast';
import WatchlistPage from './Pages/WatchlistPage';
import BacklogPage from './Pages/BacklogPage';
import MovieDetailsPage from './Pages/MovieDetailsPage';
import TvShowDetailsPage from './Pages/TvShowDetailsPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/movies/:slug/:id" element={<MovieDetailsPage />} />
          <Route path="/tv-show/:slug/:id" element={<TvShowDetailsPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
