import { motion } from "framer-motion";
import { FaStar, FaClock } from "react-icons/fa";

export default function MovieCard({ movie }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="relative group"
        >
            <div className="relative overflow-hidden rounded-xl">
                {/* Rating Badge - Always Visible */}
                <div className="absolute top-2 right-2 z-20 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="text-white font-semibold">{movie.imdbRating}</span>
                </div>

                {/* Hover Overlay */}
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                >
                    <div className="space-y-3">
                        <h3 className="text-white text-xl font-bold">{movie.Title}</h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <span>{movie.Year}</span>
                            <div className="flex items-center">
                                <FaClock className="mr-1" />
                                <span>{movie.Runtime}</span>
                            </div>
                            <span>{movie.Genre?.split(', ')[0]}</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-gray-300 text-sm line-clamp-3">
                                {movie.Plot}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                                {movie.Genre?.split(', ').map((genre, index) => (
                                    <span 
                                        key={index}
                                        className="text-xs px-2 py-1 bg-[#008B8B]/20 text-[#008B8B] rounded-full"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Movie Poster */}
                <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                    alt={movie.Title}
                    className="w-full h-[450px] object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-300"
                />

                {/* Gradient Overlay - Always Visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-30" />
            </div>
        </motion.div>
    );
} 