import React, { useContext, useEffect, useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSearch, FaTimes, FaStar as FaStarSolid, FaRegStar as FaStarOutline } from "react-icons/fa";
import NavBar from "../Components/NavBar";
import { useToast } from "../Components/Toast";
import UserContext from '../Backend/Context/UserContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist, updateRating, updateReview } from '../Backend/Context/api';
import FloatingIcons from "../Components/FloatingIcons";
import api from '../Backend/Context/api';
import { FiFilm, FiTv } from 'react-icons/fi';
import ContentFilter from '../Components/ContentFilter';


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

const WatchlistPage = () => {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [tempReview, setTempReview] = useState("");
  const { showToast } = useToast();
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [contentFilter, setContentFilter] = useState('all');

  useEffect(() => {
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleAddMovie = async (movie) => {
    try {
        console.log('Step 1 - Original movie data:', movie);
        
        // Log the API key (without revealing the full key)
        const apiKey = import.meta.env.VITE_OMDB_API_KEY;
        console.log('Step 1a - API Key exists:', !!apiKey);
        
        if (!apiKey) {
            throw new Error('OMDB API key is not configured');
        }

        const detailsResponse = await fetch(
            `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`
        );
        const movieDetails = await detailsResponse.json();
        console.log('Step 2 - OMDB movie details:', movieDetails);
        console.log('Step 3 - Runtime from API:', movieDetails.Runtime);

        // Extract runtime from movieDetails
        let runtimeMinutes = 0;
        if (movieDetails.Runtime && typeof movieDetails.Runtime === 'string') {
            console.log('Step 4a - Runtime is a string:', movieDetails.Runtime);
            const match = movieDetails.Runtime.match(/\d+/);
            console.log('Step 4b - Regex match result:', match);
            runtimeMinutes = match ? parseInt(match[0]) : 0;
            console.log('Step 4c - Parsed runtime minutes:', runtimeMinutes);
        } else {
            console.log('Step 4d - Runtime is not a string or is missing:', movieDetails.Runtime);
        }

        const movieData = {
            id: movie.imdbID,
            contentType: movieDetails.Type === "series" ? "tv-show" : "movie",
            title: movie.Title,
            review: "",
            rating: 0,
            poster: movie.Poster,
            runtime: runtimeMinutes,
            addedAt: new Date().toISOString()
        };

        console.log('Step 5 - Final movie data being sent:', movieData);
        console.log('Step 5a - Runtime in final data:', movieData.runtime);

        const response = await addToWatchlist(movieData);
        console.log('Step 6 - API response:', response);
        console.log('Step 6a - Runtime in response:', response.find(m => m.id === movie.imdbID)?.runtime);
        
        setMovies(response);
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        
        if (showToast) {
            showToast(`${movie.Title} added to watchlist!`);
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        if (showToast) {
            showToast(error.response?.data?.message || 'Failed to add movie');
        }
    }
  };

  const handleRemoveMovie = async (movieId, movieTitle) => {
    setMovieToDelete({ id: movieId, title: movieTitle });
  };

  const handleRating = async (movieId, rating) => {
    try {
        // Ensure rating is a number and within valid range
        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
            throw new Error('Invalid rating value');
        }

        console.log('Updating rating:', { movieId, rating: numericRating }); // Add logging

        const response = await updateRating(movieId, numericRating);
        
        if (response) {
            setMovies(prevMovies => 
                prevMovies.map(movie => 
                    movie.id === movieId 
                        ? { ...movie, rating: numericRating }
                        : movie
                )
            );
            if (showToast) {
                showToast("Rating saved!");
            }
        }
    } catch (error) {
        console.error('Error updating rating:', error);
        console.error('Error details:', error.response?.data); // Add detailed error logging
        if (showToast) {
            showToast(error.response?.data?.message || 'Failed to update rating');
        }
    }
  };

  const handleReviewEdit = (movie) => {
    setEditingMovie(movie.id);
    setTempReview(movie.review || '');
  };

  const handleReviewSave = async (movieId) => {
    try {
      const response = await updateReview(movieId, tempReview);
      setMovies(response);
      setEditingMovie(null);
      if (showToast) {
        showToast("Review saved!");
      }
    } catch (error) {
      console.error('Error updating review:', error);
      if (showToast) {
        showToast('Failed to update review');
      }
    }
  };

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        console.log('Fetching watchlist...');
        const watchlist = await getWatchlist();
        console.log('Fetched watchlist:', watchlist);
        setMovies(watchlist);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        showToast('Failed to fetch watchlist');
      }
    };

    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=a0c4e62f&s=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.Search) {
        console.log('Search results:', data.Search); 
        setSearchResults(data.Search.slice(0, 5));
      }
    } catch (error) {
      console.error("Search failed:", error);
      showToast("Failed to search movies");
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = ({ movieId }) => {
    const rating = movies.find((movie) => movie.id === movieId)?.rating || 0;
    
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

  const getFilteredContent = useCallback(() => {
    if (contentFilter === 'all') return movies;
    return movies.filter(item => item.contentType === contentFilter);
  }, [movies, contentFilter]);

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

          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <ContentFilter 
                currentFilter={contentFilter}
                onFilterChange={setContentFilter}
              />
            </div>
          </div>

          {movies.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {getFilteredContent().map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#2A3441]/80 backdrop-blur-sm p-4 rounded-xl"
                >
                  <div className="flex gap-4">
                   
                    <div className="flex-shrink-0">
                      {movie.poster !== 'N/A' ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-24 h-36 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-36 bg-[#2A3B4D] rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          No Poster
                        </div>
                      )}
                    </div>

                    
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                          <p className="text-sm text-gray-400">{movie.year}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMovie(movie.id, movie.title)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Rating Section */}
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Rate this movie:</p>
                        <StarRating movieId={movie.id} />
                      </div>

                      {/* Review Section */}
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-2">Your Review:</p>
                        {editingMovie === movie.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={tempReview}
                              onChange={(e) => setTempReview(e.target.value)}
                              placeholder="Write your thoughts about the movie..."
                              className="w-full p-3 rounded-lg bg-[#1E2A38] text-white text-sm resize-none focus:ring-2 focus:ring-[#008B8B] outline-none"
                              rows="3"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingMovie(null);
                                  setTempReview("");
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReviewSave(movie.id)}
                                className="px-4 py-2 bg-[#008B8B] text-white rounded-lg hover:bg-[#00BFBF] transition-colors text-sm"
                              >
                                Save Review
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {movie.review ? (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-300 bg-[#1E2A38] p-3 rounded-lg">
                                  {movie.review}
                                </p>
                                <button
                                  onClick={() => handleReviewEdit(movie)}
                                  className="text-sm text-[#008B8B] hover:text-[#00BFBF] transition-colors flex items-center gap-1"
                                >
                                  Edit Review
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleReviewEdit(movie)}
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
            </motion.div>
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
                            onClick={() => {
                              console.log('Movie clicked:', movie); 
                              handleAddMovie(movie);
                            }}
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

          {/* Confirmation Modal */}
          <AnimatePresence>
            {movieToDelete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setMovieToDelete(null);
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#1E2A38] rounded-xl shadow-xl p-6 max-w-sm w-full"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Confirm Removal</h3>
                  <p className="text-gray-300 mb-6">
                    Are you sure you want to remove "{movieToDelete.title}" from your watchlist?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setMovieToDelete(null)}
                      className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await removeFromWatchlist(movieToDelete.id);
                          setMovies(response);
                          if (showToast) {
                            showToast(`"${movieToDelete.title}" removed from watchlist!`);
                          }
                        } catch (error) {
                          console.error('Error removing from watchlist:', error);
                          if (showToast) {
                            showToast('Failed to remove movie');
                          }
                        } finally {
                          setMovieToDelete(null);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default WatchlistPage;