import React, { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSearch, FaTimes, FaCalendarAlt, FaClock, FaArrowRight } from "react-icons/fa";
import NavBar from "../Components/NavBar";
import FloatingIcons from "../Components/FloatingIcons";
import { useToast } from "../Components/Toast";
import { addToBacklog, removeFromBacklog, addToWatchlist } from "../Backend/Context/api";
import api from "../Backend/Context/api";

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

export default function BacklogPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backlogMovies, setBacklogMovies] = useState([]);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchBacklogMovies = async () => {
      try {
        const response = await api.get('/users/backlog');
        const sortedMovies = response.data.sort((a, b) => 
          new Date(b.addedAt) - new Date(a.addedAt)
        );
        setBacklogMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching backlog movies:', error);
        if (showToast) {
          showToast('Failed to load backlog movies');
        }
      }
    };

    fetchBacklogMovies();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
      );
      const data = await response.json();
      
      if (data.Response === "True") {
        setSearchResults(data.Search.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovie = async (movie) => {
    try {
      

      const movieData = {
        id: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster,
        addedAt: new Date(),
        runtime: movie.Runtime,
      };

      

      const response = await addToBacklog(movieData);
    
      
      if (response) {
        setBacklogMovies(prevMovies => {
          const newMovies = [...prevMovies, movieData];
          return newMovies.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
          );
        });
        
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        
        if (showToast) {
          showToast(`${movieData.title} added to backlog!`);
        }
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      if (showToast) {
        showToast(error.response?.data?.message || 'Failed to add movie');
      }
    }
  };

  const handleRemoveMovie = async (movieId, movieTitle) => {
    setMovieToDelete({ id: movieId, title: movieTitle });
  };

  const handleMoveToWatchlist = async (movie) => {
    try {
   

      
      await api.delete(`/users/backlog/${movie.id}`);

     
      const watchlistMovie = {
        id: movie.id,
        contentType: "movie", // Explicitly set as movie
        title: movie.title,
        review: "",
        rating: 0,
        poster: movie.poster,
        addedAt: new Date().toISOString(),
        year: movie.year || "", // Add year if available
        imdbRating: movie.imdbRating || "N/A" // Add IMDb rating if available
      };

 

      const watchlistResponse = await addToWatchlist(watchlistMovie);
     
      
      if (watchlistResponse) {
        
        setBacklogMovies(prevMovies => 
          prevMovies.filter(m => m.id !== movie.id)
        );
        
        if (showToast) {
          showToast(`${movie.title} moved to watchlist!`);
        }
      }
    } catch (error) {
      console.error('Error details:', error.response?.data); // More detailed error logging
      if (showToast) {
        showToast(error.response?.data?.message || 'Failed to move movie to watchlist');
      }
      
      // If watchlist add fails, try to restore to backlog
      try {
        const backlogMovie = {
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          addedAt: new Date().toISOString()
        };
        await addToBacklog(backlogMovie);
      } catch (restoreError) {
        console.error('Failed to restore movie to backlog:', restoreError);
        if (showToast) {
          showToast('Error occurred. Please refresh the page.');
        }
      }
    }
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
                My Backlog
              </h1>
              <p className="text-gray-400 text-base">
                Movies and shows you want to watch
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

          {backlogMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {backlogMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#1E2A38] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {movie.poster !== 'N/A' ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2A3B4D] flex items-center justify-center text-gray-400">
                        No Poster
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveMovie(movie.id, movie.title)}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 line-clamp-2">
                      {movie.title}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400 text-sm">
                          <FaCalendarAlt className="mr-1" />
                          <span>
                            {new Date(movie.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleMoveToWatchlist(movie)}
                          className="flex items-center gap-1.5 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white px-2.5 py-1 rounded-md transition-all duration-300 text-sm group"
                          title="Move to Watchlist"
                        >
                          <span className="font-medium">Move</span>
                          <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-8">
              No movies in your backlog yet.
            </div>
          )}

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
                            onClick={() => handleAddMovie(movie)}
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

          {/* Add Confirmation Modal */}
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
                    Are you sure you want to remove "{movieToDelete.title}" from your backlog?
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
                          const response = await removeFromBacklog(movieToDelete.id);
                          setBacklogMovies(response);
                          if (showToast) {
                            showToast(`"${movieToDelete.title}" removed from backlog!`);
                          }
                        } catch (error) {
                          console.error('Error removing from backlog:', error);
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
}