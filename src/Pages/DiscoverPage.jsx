import React, { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../Components/NavBar";
import ScrollReveal from "../Components/ScrollReveal";
import LoadingSpinner from "../Components/LoadingSpinner";
import { Carousel, Card } from "../Components/CardCarousel";
import FloatingIcons from "../Components/FloatingIcons";
import { FiRefreshCw } from "react-icons/fi";
import { FaFilm, FaRegCompass } from "react-icons/fa";


const filterOptions = {
    years: ['2024', '2023', '2022', '2021', '2020', '2019', '2018'],
    genres: [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama',
        'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
    ]
};

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

const StatsCard = ({ icon: Icon, label, value }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2A3441]/50 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4"
    >
        <div className="bg-[#008B8B]/20 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-[#008B8B]" />
        </div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </div>
    </motion.div>
);

export default function DiscoverPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [contentFilter, setContentFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getRandomYear = () => {
        const currentYear = new Date().getFullYear();
        return Math.floor(Math.random() * (currentYear - 2010 + 1)) + 2010;
    };

    const getRandomGenre = () => {
        const genres = [
            'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama',
            'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
        ];
        return genres[Math.floor(Math.random() * genres.length)];
    };

    const fetchMovies = async () => {
        setIsRefreshing(true);
        setError(null);
        const moviesData = [];
        const seenMovies = new Set();

        try {
            for (let i = 0; i < 3; i++) {
                const year = getRandomYear();
                const genre = getRandomGenre();
                
                const response = await fetch(
                    `https://www.omdbapi.com/?apikey=a0c4e62f&s=${genre}&y=${year}&type=movie`
                );
                const data = await response.json();

                if (data.Response === "True" && data.Search) {
                    const detailedMoviePromises = data.Search
                        .filter(movie => !seenMovies.has(movie.imdbID))
                        .slice(0, 4)
                        .map(movie => 
                            fetch(`https://www.omdbapi.com/?apikey=a0c4e62f&i=${movie.imdbID}`)
                                .then(res => res.json())
                        );

                    const detailedMovies = await Promise.all(detailedMoviePromises);
                    detailedMovies.forEach(movie => {
                        if (movie.Response === "True" && !seenMovies.has(movie.imdbID)) {
                            seenMovies.add(movie.imdbID);
                            moviesData.push(movie);
                        }
                    });
                }
            }

            if (moviesData.length === 0) {
                throw new Error("No movies found");
            }

            const shuffledMovies = moviesData.sort(() => Math.random() - 0.5);
            setMovies(shuffledMovies);
        } catch (err) {
            setError("Failed to fetch movies");
            console.error(err);
        }
        setLoading(false);
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchMovies();
        const refreshInterval = setInterval(fetchMovies, 300000);
        return () => clearInterval(refreshInterval);
    }, []);

    const getFilteredMovies = useCallback(() => {
        if (contentFilter === 'all') return movies;
        return movies.filter(movie => 
            contentFilter === 'movie' ? movie.Type === 'movie' : movie.Type === 'series'
        );
    }, [movies, contentFilter]);

    const movieCards = getFilteredMovies().map((movie, index) => ({
        src: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster',
        title: movie.Title,
        category: `${movie.Year} · ${movie.Genre?.split(', ')[0]}`,
        content: (
            <div className="space-y-6">
                <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                        ⭐ {movie.imdbRating}
                    </span>
                    <span>{movie.Runtime}</span>
                    <span>{movie.Rated}</span>
                </div>
                
                <p className="text-gray-300 leading-relaxed">{movie.Plot}</p>
                
                <div className="space-y-4">
                    <div>
                        <span className="text-gray-400">Director:</span>
                        <span className="ml-2 text-white">{movie.Director}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Cast:</span>
                        <span className="ml-2 text-white">{movie.Actors}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {movie.Genre?.split(', ').map((genre, index) => (
                        <span 
                            key={index}
                            className="text-xs px-3 py-1 bg-[#008B8B]/20 text-[#008B8B] rounded-full"
                        >
                            {genre}
                        </span>
                    ))}
                </div>
            </div>
        )
    }));

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative">
                <Background />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <motion.div 
                                className="inline-block mb-3"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <FaRegCompass className="w-12 h-12 text-[#008B8B] mx-auto mb-4 mt-6" />
                            </motion.div>
                            <motion.h1 
                                className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#008B8B] to-teal-400 mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                Discover Movies
                            </motion.h1>
                            <motion.p 
                                className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Explore a curated selection of cinematic masterpieces
                            </motion.p>
                            
                            <div className="flex justify-center mb-8">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={fetchMovies}
                                    disabled={loading || isRefreshing}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#008B8B] to-teal-500 text-white px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-[#008B8B]/20 hover:shadow-2xl disabled:opacity-50"
                                >
                                    <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh Movies
                                </motion.button>
                            </div>
                        </div>
                    </ScrollReveal>

                    <AnimatePresence>
                        {loading && !isRefreshing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-12 space-y-4"
                            >
                                <LoadingSpinner />
                                <p className="text-gray-400 animate-pulse">Discovering movies...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                className="text-red-400 text-center mt-4 p-6 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <p className="text-lg font-semibold mb-2">Oops!</p>
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {movies.length > 0 && (
                            <motion.div 
                                className="mt-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Carousel
                                    items={movieCards.map((card, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`transition-all duration-300 ${
                                                hoveredIndex !== null && hoveredIndex !== index 
                                                    ? 'blur-sm brightness-50 scale-95' 
                                                    : ''
                                            }`}
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        >
                                            <Card card={card} index={index} layout={true} />
                                        </motion.div>
                                    ))}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}