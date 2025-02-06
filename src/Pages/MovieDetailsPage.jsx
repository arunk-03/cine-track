import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import NavBar from "../Components/NavBar";
import ScrollReveal from "../Components/ScrollReveal";
import LoadingSpinner from "../Components/LoadingSpinner";
import FloatingIcons from "../Components/FloatingIcons";

const Background = () => (
  <div className="absolute inset-0">
    <FloatingIcons 
      key="background-icons"
      iconColor="text-[#008B8B]" 
      iconOpacity="10"
      iconCount={15}
      className="z-0"
    />
  </div>
);

const MovieDetail = () => {
  const { slug, id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?i=${id}&apikey=${import.meta.env.VITE_API_KEY}&plot=full`
        );
        const data = await response.json();
        
        if (data.Response === 'False') {
          setError(data.Error);
          return;
        }
        
        setMovie(data);
      } catch (err) {
        setError('Failed to fetch movie details');
      }
    };

    fetchMovie();
  }, [id]);

  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative">
          <Background />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <motion.div 
              className="text-red-400 text-center mt-4 p-3 bg-red-500/10 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative">
          <Background />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex justify-center"
            >
              <LoadingSpinner />
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative">
        <Background />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <ScrollReveal>
            <motion.div 
              className="bg-[#2A3441]/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1 
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#008B8B] to-teal-400 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {movie.Title}
              </motion.h1>

              <div className="flex flex-wrap gap-4 text-sm mb-6">
                <span className="flex items-center gap-1 text-yellow-400">
                  ⭐ {movie.imdbRating}
                </span>
                <span className="text-gray-300">{movie.Runtime}</span>
                <span className="text-gray-300">{movie.Rated}</span>
                <span className="text-gray-300">{movie.Year}</span>
              </div>
              
              <div className="grid lg:grid-cols-12 gap-8">
                <motion.div
                  className="lg:col-span-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="sticky top-8">
                    <img 
                      src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                      alt={movie.Title} 
                      className="w-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
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
                </motion.div>

                <motion.div 
                  className="lg:col-span-8 space-y-8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[#008B8B]">Synopsis</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">{movie.Plot}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-[#008B8B]">Cast & Crew</h2>
                      <div>
                        <span className="text-gray-400">Director:</span>
                        <span className="ml-2 text-white">{movie.Director}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Writers:</span>
                        <span className="ml-2 text-white">{movie.Writer}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Cast:</span>
                        <span className="ml-2 text-white">{movie.Actors}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-[#008B8B]">Details</h2>
                      <div>
                        <span className="text-gray-400">Released:</span>
                        <span className="ml-2 text-white">{movie.Released}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Box Office:</span>
                        <span className="ml-2 text-white">{movie.BoxOffice || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Awards:</span>
                        <span className="ml-2 text-white">{movie.Awards}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-[#008B8B]">Ratings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {movie.Ratings?.map((rating, index) => (
                        <div 
                          key={index}
                          className="bg-[#1E2A38]/50 p-4 rounded-lg"
                        >
                          <div className="text-gray-400 text-sm">{rating.Source}</div>
                          <div className="text-white font-semibold mt-1">{rating.Value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default MovieDetail;