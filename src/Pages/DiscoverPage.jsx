import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import NavBar from "../Components/NavBar";
import ScrollReveal from "../Components/ScrollReveal";
import LoadingSpinner from "../Components/LoadingSpinner";
import { Carousel, Card } from "../Components/CardCarousel";
import FloatingIcons from "../Components/FloatingIcons";

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

export default function DiscoverPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const getRandomYear = () => {
        const currentYear = new Date().getFullYear();
        return Math.floor(Math.random() * (currentYear - 1990 + 1)) + 1990;
    };

    const getRandomGenre = () => {
        return filterOptions.genres[Math.floor(Math.random() * filterOptions.genres.length)];
    };

    const fetchMovies = async () => {
        setLoading(true);
        setError(null);
        const moviesData = [];
        const seenMovies = new Set();

        try {
            // Fetch multiple sets of movies with different years and genres
            for (let i = 0; i < 3; i++) {
                const year = getRandomYear();
                const genre = getRandomGenre();
                
                const response = await fetch(
                    `https://www.omdbapi.com/?apikey=a0c4e62f&s=${genre}&y=${year}&type=movie`
                );
                const data = await response.json();

                if (data.Response === "True" && data.Search) {
                    // Get detailed info for each movie
                    const detailedMoviePromises = data.Search
                        .filter(movie => !seenMovies.has(movie.imdbID))
                        .slice(0, 4) // Limit to 4 movies per genre
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

            // Shuffle the movies array
            const shuffledMovies = moviesData.sort(() => Math.random() - 0.5);
            setMovies(shuffledMovies);
        } catch (err) {
            setError("Failed to fetch movies");
            console.error(err);
        }
        setLoading(false);
    };

    // Fetch movies on initial load and set up auto-refresh interval
    useEffect(() => {
        fetchMovies();
        const refreshInterval = setInterval(fetchMovies, 300000); // Refresh every 5 minutes
        return () => clearInterval(refreshInterval);
    }, []);

    const movieCards = movies.map((movie, index) => ({
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
                        <div className="text-center mb-6">
                            <motion.h1 
                                className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#008B8B] to-teal-400 pt-10 mb-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                Discover Modern Movies
                            </motion.h1>
                            <motion.p 
                                className="text-gray-400 text-base md:text-lg mb-6 max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Explore a curated selection of movies from 2010 onwards
                            </motion.p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchMovies}
                                className="bg-[#008B8B] hover:bg-[#008B8B]/90 text-white px-6 py-2.5 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-[#008B8B]/20 hover:shadow-2xl"
                                disabled={loading}
                            >
                                Refresh Movies
                            </motion.button>
                        </div>
                    </ScrollReveal>

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-4"
                        >
                            <LoadingSpinner />
                        </motion.div>
                    )}
                    
                    {error && (
                        <motion.div 
                            className="text-red-400 text-center mt-4 p-3 bg-red-500/10 rounded-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {movies.length > 0 && (
                        <motion.div 
                            className="mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Carousel
                                items={movieCards.map((card, index) => (
                                    <div
                                        key={index}
                                        className={`transition-all duration-300 ${
                                            hoveredIndex !== null && hoveredIndex !== index 
                                                ? 'blur-sm brightness-50 scale-95' 
                                                : ''
                                        }`}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        <Card card={card} index={index} layout={true} />
                                    </div>
                                ))}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}