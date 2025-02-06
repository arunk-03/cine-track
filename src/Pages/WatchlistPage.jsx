import React, { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSearch, FaTimes, FaStar as FaStarSolid, FaRegStar as FaStarOutline } from "react-icons/fa";
import NavBar from "../Components/NavBar";
import FloatingIcons from "../Components/FloatingIcons";
import { useToast } from "../Components/Toast";

const Background = memo(() => (
  <div className="absolute inset-0">
    <FloatingIcons 
      key="background-icons"
      iconColor="text-[#008B8B]" 
      iconOpacity="10"
      iconCount={15}
      className="z-0"
    />
  </div>
));

export default function WatchlistPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [editingMovie, setEditingMovie] = useState(null);
  const { showToast } = useToast();

  // Load saved data from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    const savedRatings = localStorage.getItem('watchlistRatings');
    const savedReviews = localStorage.getItem('watchlistReviews');
    
    if (savedWatchlist) setWatchlistMovies(JSON.parse(savedWatchlist));
    if (savedRatings) setRatings(JSON.parse(savedRatings));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlistMovies));
    localStorage.setItem('watchlistRatings', JSON.stringify(ratings));
    localStorage.setItem('watchlistReviews', JSON.stringify(reviews));
  }, [watchlistMovies, ratings, reviews]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=a0c4e62f&s=${query}&type=movie`
      );
      const data = await response.json();
      
      if (data.Search) {
        setSearchResults(data.Search.slice(0, 5));
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTowatchlist = (movie) => {
    const now = new Date();
    const dateLogged = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeLogged = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const newMovie = {
      ...movie,
      dateLogged,
      timeLogged,
      id: movie.imdbID
    };
    
    setWatchlistMovies(prev => [newMovie, ...prev]);
    showToast(`Added "${movie.Title}" to watchlist`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFromWatchlist = (imdbID) => {
    setWatchlistMovies(prev => prev.filter(movie => movie.imdbID !== imdbID));
    setRatings(prev => {
      const newRatings = { ...prev };
      delete newRatings[imdbID];
      return newRatings;
    });
    setReviews(prev => {
      const newReviews = { ...prev };
      delete newReviews[imdbID];
      return newReviews;
    });
    showToast("Movie removed from watchlist!");
  };

  const handleRating = (movieId, rating) => {
    setRatings(prev => ({
      ...prev,
      [movieId]: rating
    }));
    showToast("Rating saved!");
  };

  const handleReview = (movieId, review) => {
    setReviews(prev => ({
      ...prev,
      [movieId]: review
    }));
  };

  const StarRating = ({ movieId }) => {
    const rating = ratings[movieId] || 0;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(movieId, star)}
            className="text-yellow-400 hover:scale-110 transition-transform"
          >
            {star <= rating ? <FaStarSolid /> : <FaStarOutline />}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative pt-20">
        <Background />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-left"
            >
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#008B8B] to-teal-400 mb-2">
                My Watchlist
              </h1>
              <p className="text-gray-400 text-base">
                Rate and review movies you've watched
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              className="bg-[#008B8B] hover:bg-[#008B8B]/90 text-white h-10 w-10 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[#008B8B]/20 hover:shadow-2xl flex items-center justify-center"
            >
              <FaPlus className="text-lg" />
            </motion.button>
          </div>

          {watchlistMovies.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {watchlistMovies.map((movie, index) => (
                <motion.div
                  key={movie.imdbID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#2A3441]/80 backdrop-blur-sm p-4 rounded-xl"
                >
                  <div className="flex gap-4">
                    {/* Movie Poster */}
                    <div className="flex-shrink-0">
                      {movie.Poster !== 'N/A' ? (
                        <img
                          src={movie.Poster}
                          alt={movie.Title}
                          className="w-24 h-36 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-36 bg-[#2A3B4D] rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          No Poster
                        </div>
                      )}
                    </div>

                    {/* Movie Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{movie.Title}</h3>
                          <p className="text-sm text-gray-400">{movie.Year}</p>
                        </div>
                        <button
                          onClick={() => removeFromWatchlist(movie.imdbID)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Rating Section */}
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Rate this movie:</p>
                        <StarRating movieId={movie.imdbID} />
                      </div>

                      {/* Review Section */}
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Your Review:</p>
                        {editingMovie === movie.imdbID ? (
                          <div className="space-y-2">
                            <textarea
                              value={reviews[movie.imdbID] || ''}
                              onChange={(e) => handleReview(movie.imdbID, e.target.value)}
                              placeholder="Write your thoughts about the movie..."
                              className="w-full p-3 rounded-lg bg-[#1E2A38] text-white text-sm resize-none focus:ring-2 focus:ring-[#008B8B] outline-none"
                              rows="3"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingMovie(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMovie(null);
                                  showToast("Review saved!");
                                }}
                                className="px-4 py-2 bg-[#008B8B] text-white rounded-lg hover:bg-[#00BFBF] transition-colors text-sm"
                              >
                                Save Review
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {reviews[movie.imdbID] ? (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-300 bg-[#1E2A38] p-3 rounded-lg">
                                  {reviews[movie.imdbID]}
                                </p>
                                <button
                                  onClick={() => setEditingMovie(movie.imdbID)}
                                  className="text-sm text-[#008B8B] hover:text-[#00BFBF] transition-colors flex items-center gap-1"
                                >
                                  Edit Review
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingMovie(movie.imdbID)}
                                className="px-4 py-2 bg-[#1E2A38] text-[#008B8B] rounded-lg hover:bg-[#1E2A38]/80 transition-colors text-sm flex items-center gap-2"
                              >
                                <FaPlus className="text-xs" />
                                Add Your Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400">Your watchlist is empty.</p>
              <p className="text-gray-500 text-sm mt-2">
                Click the + button to add movies you've watched.
              </p>
            </motion.div>
          )}

          {/* Search Modal */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#1E2A38] rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-700">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        placeholder="Search for a movie..."
                        className="w-full bg-[#2A3441] text-white rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-[#008B8B]"
                        autoFocus
                      />
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {isLoading && (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008B8B] mx-auto"></div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="max-h-[40vh] overflow-y-auto">
                      <div className="p-2">
                        {searchResults.map((movie) => (
                          <button
                            key={movie.imdbID}
                            onClick={() => addTowatchlist(movie)}
                            className="w-full p-2 hover:bg-[#008B8B]/10 rounded-lg flex items-center gap-3 transition-colors group"
                          >
                            {movie.Poster !== 'N/A' ? (
                              <img
                                src={movie.Poster}
                                alt={movie.Title}
                                className="w-10 h-14 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-14 bg-[#2A3B4D] rounded flex items-center justify-center text-gray-400 text-xs">
                                No Poster
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <h4 className="text-white font-medium group-hover:text-[#008B8B] transition-colors">
                                {movie.Title}
                              </h4>
                              <p className="text-gray-400 text-sm">{movie.Year}</p>
                            </div>
                            <FaPlus className="text-gray-400 group-hover:text-[#008B8B] transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isLoading && searchQuery && searchResults.length === 0 && (
                    <div className="p-4 text-center text-gray-400">
                      No movies found.
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}