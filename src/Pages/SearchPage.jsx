import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlus, FaList, FaStar, FaFilm, FaTv, FaCheck } from "react-icons/fa";
import NavBar from "../Components/NavBar";
import FloatingIcons from "../Components/FloatingIcons";
import { useToast } from "../Components/Toast";
import { addToWatchlist, addToBacklog } from "../Backend/Context/api";
import api from "../Backend/Context/api";
import { createSlug } from "../utils";
import ContentFilter from '../Components/ContentFilter';

const Background = React.memo(() => (
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

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const query = searchParams.get('q') || '';
  const [addedToWatchlist, setAddedToWatchlist] = useState(new Set());
  const [addedToBacklog, setAddedToBacklog] = useState(new Set());
  const [contentFilter, setContentFilter] = useState('all');

  // Fetch existing watchlist and backlog items
  useEffect(() => {
    const fetchExistingItems = async () => {
      try {
        const [watchlistResponse, backlogResponse] = await Promise.all([
          api.get('/users/watchlist'),
          api.get('/users/backlog')
        ]);

        // Add existing watchlist items to Set
        const watchlistIds = new Set(
          watchlistResponse.data.map(item => item.id)
        );
        setAddedToWatchlist(watchlistIds);

        // Add existing backlog items to Set
        const backlogIds = new Set(
          backlogResponse.data.map(item => item.id)
        );
        setAddedToBacklog(backlogIds);

      } catch (error) {
        console.error('Error fetching existing items:', error);
      }
    };

    fetchExistingItems();
  }, []); // Run once when component mounts

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(`https://www.omdbapi.com/?apikey=${import.meta.env.VITE_API_KEY}&s=${encodeURIComponent(query)}&type=movie`),
          fetch(`https://www.omdbapi.com/?apikey=${import.meta.env.VITE_API_KEY}&s=${encodeURIComponent(query)}&type=series`)
        ]);

        const [movieData, tvData] = await Promise.all([
          movieResponse.json(),
          tvResponse.json()
        ]);

        const combinedResults = [];

        if (movieData.Response === "True") {
          combinedResults.push(...movieData.Search.map(item => ({ ...item, contentType: 'movie' })));
        }
        
        if (tvData.Response === "True") {
          combinedResults.push(...tvData.Search.map(item => ({ ...item, contentType: 'tv-show' })));
        }

        setSearchResults(combinedResults.sort((a, b) => parseInt(b.Year) - parseInt(a.Year)));
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleAddToWatchlist = async (movie) => {
    try {
      const detailsResponse = await fetch(
        `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_API_KEY}&i=${movie.imdbID}`
      );
      const movieDetails = await detailsResponse.json();
      

      
      let runtime = 0;
      if (movieDetails.Runtime) {
        const matches = movieDetails.Runtime.match(/\d+/);
        runtime = matches ? parseInt(matches[0]) : 0;
      }

      const movieData = {
        id: movie.imdbID,
        contentType: "movie",
        title: movie.Title,
        review: "",
        rating: 0,
        poster: movie.Poster,
        runtime: runtime, // Use the extracted runtime
        addedAt: new Date().toISOString()
      };

     

      const response = await addToWatchlist(movieData);
      
      if (response) {
        setAddedToWatchlist(prev => new Set([...prev, movie.imdbID]));
        if (showToast) {
          showToast(`${movie.Title} added to watchlist!`);
        }
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      if (showToast) {
        showToast(error.response?.data?.message || 'Failed to add movie');
      }
    }
  };

  const handleAddToBacklog = async (movie) => {
    try {
      // Check if movie is already in watchlist
      if (addedToWatchlist.has(movie.imdbID)) {
        showToast(`${movie.Title} is already in your watchlist. Please remove it first.`);
        return;
      }

      const movieData = {
        id: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster,
        addedAt: new Date()
      };

      const response = await addToBacklog(movieData);
      
      if (response) {
        setAddedToBacklog(prev => new Set([...prev, movie.imdbID]));
        if (showToast) {
          showToast(`${movie.Title} added to backlog!`);
        }
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      if (showToast) {
        showToast(error.response?.data?.message || 'Failed to add movie');
      }
    }
  };

  // Add this function to filter content
  const getFilteredContent = useCallback(() => {
    if (contentFilter === 'all') return searchResults;
    return searchResults.filter(item => item.contentType === contentFilter);
  }, [searchResults, contentFilter]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative pt-20">
        <Background />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#008B8B] to-teal-400 mb-2">
              Search Results
            </h1>
            <p className="text-gray-400 text-base">
              {query ? `Showing results for "${query}"` : 'Enter a search term to find movies'}
            </p>
          </motion.div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              {/* Your existing search input */}
            </div>
            <div className="ml-4">
              <ContentFilter 
                currentFilter={contentFilter}
                onFilterChange={setContentFilter}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008B8B]"></div>
            </div>
          ) : getFilteredContent().length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {getFilteredContent().map((item, index) => (
                <motion.div
                  key={item.imdbID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#1E2A38] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Link 
                    to={`/${item.contentType === 'movie' ? 'movies' : 'tv-show'}/${createSlug(item.Title)}/${item.imdbID}`}
                    className="block relative"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          item.contentType === 'movie' 
                            ? 'bg-blue-500/80 text-white' 
                            : 'bg-purple-500/80 text-white'
                        }`}>
                          {item.contentType === 'movie' ? (
                            <><FaFilm className="mr-1" /> Movie</>
                          ) : (
                            <><FaTv className="mr-1" /> TV Show</>
                          )}
                        </span>
                      </div>

                      {item.Poster !== 'N/A' ? (
                        <img
                          src={item.Poster}
                          alt={item.Title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2A3B4D] flex items-center justify-center text-gray-400">
                          No Poster
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">View Details</span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-3">
                    <Link 
                      to={`/${item.contentType === 'movie' ? 'movies' : 'tv-show'}/${createSlug(item.Title)}/${item.imdbID}`}
                      className="block"
                    >
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 hover:text-[#008B8B] transition-colors">
                        {item.Title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>{item.Year}</span>
                      <span className="flex items-center">
                        <FaStar className="text-yellow-500 mr-1" />
                        {item.imdbRating || 'N/A'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {addedToWatchlist.has(item.imdbID) ? (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-1 bg-green-500/20 text-green-500 px-2 py-1 rounded transition-all duration-300 text-xs"
                        >
                          <FaCheck className="text-xs" />
                          <span>Added to Watchlist</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToWatchlist(item);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#008B8B] hover:bg-[#008B8B]/90 text-white px-2 py-1 rounded transition-all duration-300 text-xs"
                        >
                          <FaPlus className="text-xs" />
                          <span>Watchlist</span>
                        </button>
                      )}
                      
                      {addedToBacklog.has(item.imdbID) ? (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-1 bg-green-500/20 text-green-500 px-2 py-1 rounded transition-all duration-300 text-xs"
                        >
                          <FaCheck className="text-xs" />
                          <span>Added to Backlog</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToBacklog(item);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#1E2A38] hover:bg-[#2A3B4D] text-[#008B8B] border border-[#008B8B] px-2 py-1 rounded transition-all duration-300 text-xs"
                        >
                          <FaList className="text-xs" />
                          <span>Backlog</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : query ? (
            <div className="text-center text-gray-400 py-12">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
} 