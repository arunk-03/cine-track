import { UserProvider } from './Backend/Context/UserContext.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import AboutPage from './Pages/AboutPage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import DiscoverPage from './Pages/DiscoverPage';
import { ToastContainer } from './Components/Toast';
import WatchlistPage from './Pages/WatchlistPage';
import BacklogPage from './Pages/BacklogPage';
import MovieDetailsPage from './Pages/MovieDetailsPage';
import TvShowDetailsPage from './Pages/TvShowDetailsPage';
import ProtectedRoute from './Components/ProtectedRoute';
import SearchPage from "./Pages/SearchPage";
import ProfilePage from "./Pages/ProfilePage";

function App() {
  return (
    <UserProvider>
      <ToastContainer>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
            <Route path="/backlog" element={<ProtectedRoute><BacklogPage /></ProtectedRoute>} />
            <Route path="/movies/:slug/:id" element={<ProtectedRoute><MovieDetailsPage /></ProtectedRoute>} />
            <Route path="/tv-show/:slug/:id" element={<ProtectedRoute><TvShowDetailsPage /></ProtectedRoute>} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </ToastContainer>
    </UserProvider>
  );
}

export default App;
