import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSearch, FaTimes, FaCalendarAlt, FaClock } from "react-icons/fa";
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

export default function watchlistPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [watchlistMovies, setwatchlistMovies] = useState([]);
  const { showToast } = useToast();

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
    
    setwatchlistMovies(prev => [newMovie, ...prev]);
    showToast(`Added "${movie.Title}" to watchlist`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
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
                My watchlist
              </h1>
              <p className="text-gray-400 text-base">
                Movies and shows you've watched
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watchlistMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#1E2A38] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {movie.Poster !== 'N/A' ? (
                      <img
                        src={movie.Poster}
                        alt={movie.Title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2A3B4D] flex items-center justify-center text-gray-400 text-sm">
                        No Poster
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">{movie.Title}</h3>
                    <p className="text-gray-400 text-xs mb-2">{movie.Year}</p>
                    <div className="flex flex-col gap-1 text-xs text-[#008B8B]">
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-[10px]" />
                        <span className="truncate">{movie.dateLogged}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaClock className="text-[10px]" />
                        <span>{movie.timeLogged}</span>
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
              <p className="text-gray-400 text-lg">
                Your watchlist is empty. Start adding movies you want to watch!
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-[#1E2A38] rounded-xl shadow-2xl border border-white/10 overflow-hidden mx-4">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Search Movies</h3>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      placeholder="Type movie name..."
                      className="w-full bg-[#2A3B4D] text-white pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008B8B] text-sm placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                </div>

                {isLoading && (
                  <div className="px-4 py-6 text-gray-400 text-center flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#008B8B] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="max-h-[40vh] overflow-y-auto">
                    <div className="p-2">
                      {searchResults.map((movie) => (
                        <motion.button
                          key={movie.imdbID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => addTowatchlist(movie)}
                          className="w-full p-2 hover:bg-[#008B8B]/10 rounded-lg flex items-center gap-3 transition-colors group"
                        >
                          {movie.Poster !== 'N/A' ? (
                            <img
                              src={movie.Poster}
                              alt={movie.Title}
                              className="w-10 h-14 object-cover rounded shadow-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-[#2A3B4D] rounded flex items-center justify-center text-gray-400 text-xs">
                              No Poster
                            </div>
                          )}
                          <div className="text-left flex-1">
                            <p className="text-white text-sm font-medium group-hover:text-[#008B8B] transition-colors">{movie.Title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{movie.Year}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaPlus className="text-[#008B8B] text-sm" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && !isLoading && searchResults.length === 0 && (
                  <div className="px-4 py-6 text-gray-400 text-center text-sm">
                    No movies found for "{searchQuery}"
                  </div>
                )}

                {!searchQuery && !isLoading && (
                  <div className="px-4 py-6 text-gray-400 text-center text-sm">
                    Start typing to search for movies
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 