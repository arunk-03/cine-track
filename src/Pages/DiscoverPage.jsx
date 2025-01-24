import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MovieCard from "../Components/MovieCard";
import FloatingIcons from "../Components/FloatingIcons";
import NavBar from "../Components/NavBar";
import ScrollReveal from "../Components/ScrollReveal";
import LoadingSpinner from "../Components/LoadingSpinner";
import { Carousel, Card } from "../Components/CardCarousel";

const Background = () => (
    <div className="absolute inset-0">
        <FloatingIcons 
            iconColor="text-[#008B8B]" 
            iconOpacity="10"
            iconCount={15}
            className="z-0"
        />
    </div>
);

const filterOptions = {
    years: Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString())
        .filter(year => parseInt(year) >= 2010),
    genres: [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama',
        'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
    ]
};

export default function DiscoverPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getRandomYear = () => {
        const currentYear = new Date().getFullYear();
        return Math.floor(Math.random() * (currentYear - 2010 + 1)) + 2010;
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
                        if (movie.Response === "True" && 
                            !seenMovies.has(movie.imdbID) && 
                            parseInt(movie.Year) >= 2010) {
                            seenMovies.add(movie.imdbID);
                            moviesData.push(movie);
                        }
                    });
                }
            }

            if (moviesData.length === 0) {
                throw new Error("No movies found");
            }

            setMovies(moviesData.sort(() => Math.random() - 0.5));
        } catch (err) {
            setError("Failed to fetch movies");
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMovies();
        const refreshInterval = setInterval(fetchMovies, 300000);
        return () => clearInterval(refreshInterval);
    }, []);

    const movieCards = movies.map((movie, index) => ({
        src: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster',
        title: movie.Title,
        category: `${movie.Year} · ${movie.Genre?.split(', ')[0]}`,
        content: (
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="flex items-center gap-1">⭐ {movie.imdbRating}</span>
                    <span>{movie.Runtime}</span>
                </div>
                
                <p className="text-gray-300 leading-relaxed line-clamp-4">{movie.Plot}</p>
                
                <div className="flex flex-wrap gap-2">
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
            <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative pt-16 pb-8">
                <Background />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Discover Modern Movies</h1>
                            <p className="text-gray-400 text-base mb-4">
                                Explore a curated selection of movies from 2010 onwards
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchMovies}
                                className="bg-[#008B8B] hover:bg-[#008B8B]/90 text-white px-6 py-2 rounded-lg text-base font-semibold transition-colors"
                                disabled={loading}
                            >
                                Refresh Movies
                            </motion.button>
                        </div>
                    </ScrollReveal>

                    {loading && <LoadingSpinner />}
                    
                    {error && (
                        <div className="text-red-400 text-center mt-4">
                            {error}
                        </div>
                    )}

                    {movies.length > 0 && (
                        <div className="mt-4">
                            <Carousel
                                items={movieCards.map((card, index) => (
                                    <Card key={index} card={card} index={index} layout={true} />
                                ))}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 