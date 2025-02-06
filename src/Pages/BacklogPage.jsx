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

export default function BacklogPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backlogMovies, setBacklogMovies] = useState([]);
  const { showToast } = useToast();

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

  const addToBacklog = (movie) => {
    const now = new Date();
    const dateLogged = now.toLocaleDateString();
    const timeLogged = now.toLocaleTimeString();

    const newMovie = {
      ...movie,
      dateLogged,
      timeLogged,
    };

    setBacklogMovies(prev => [...prev, newMovie]);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
    showToast("Movie added to backlog!");
  };

  const removeFromBacklog = (imdbID) => {
    setBacklogMovies(prev => prev.filter(movie => movie.imdbID !== imdbID));
    showToast("Movie removed from backlog!");
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
                  key={movie.imdbID}
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
              <p className="text-gray-400">No movies in your backlog yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Click the + button to add movies you plan to watch later.
              </p>
            </motion.div>
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
                            onClick={() => addToBacklog(movie)}
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