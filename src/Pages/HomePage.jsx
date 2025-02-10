import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, memo, useContext, createContext } from 'react';
import { 
    FaPlay, 
    FaStar,
    FaRegClock,
    FaRegHeart,
    FaRegBookmark,
    FaRegCompass
} from 'react-icons/fa';
import TypewriterText from '../Components/TypewriterText';
import FloatingIcons from '../Components/FloatingIcons';
import NavBar from '../Components/NavBar';
import UserContext from '../Backend/Context/UserContext.jsx';

// Create a memoized background component
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

export default function HomePage() {
    const context = useContext(UserContext);
    
    if (!context) {
        return <div>Context not available</div>;
    }

    const { user, loading } = context;

    if (loading) {
        return <div>Loading...</div>;
    }

    const [currentPosterIndex, setCurrentPosterIndex] = useState(0);

    const moviePosters = [
        {
            url: 'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg',
            title: 'Fast X',
            rating: '4.5'
        },
        {
            url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
            title: 'The Shawshank Redemption',
            rating: '4.8'
        },
        {
            url: 'https://image.tmdb.org/t/p/w500/8kSerJrhrJWKLk1LViesGcnrUPE.jpg',
            title: 'Movie 3',
            rating: '4.3'
        },
        {
            url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
            title: 'Parasite',
            rating: '4.7'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPosterIndex((prev) => (prev + 1) % moviePosters.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [moviePosters.length]);

    return (
        <div className="h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative overflow-hidden">
            {/* Memoized background */}
            <Background />
            <NavBar />

            <div className="max-w-7xl mx-[7%] h-full px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                <div className="block lg:grid lg:grid-cols-2 gap-12 items-start h-full pt-10 mt-5">
                    {/* Left Content */}
                    <div className="space-y-8 p-0 pt-6">
                        <motion.h1 
                            className="text-xl md:text-6xl font-bold text-white"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <TypewriterText 
                                phrases={[
                                    "Your Cinema Journey",
                                    "Track Your Movies",
                                    "Share Your Reviews",
                                    "Discover New Films"
                                ]}
                                className="text-white text-[32px] md:text-[52px]"
                            />
                        </motion.h1>

                        <motion.p 
                            className="text-gray-300 text-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Track your watched films, share reviews, and discover your next favorite movie.
                        </motion.p>

                        <motion.button
                            className="bg-[#008B8B] hover:bg-[#008B8B]/80 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlay /> Get Started
                        </motion.button>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[
                                { icon: FaRegClock, text: "Track Watch Time" },
                                { icon: FaRegHeart, text: "Save Favorites" },
                                { icon: FaRegBookmark, text: "Create Watchlist" },
                                { icon: FaRegCompass, text: "Discover New" }
                            ].map(({ icon: Icon, text }, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-[#1E2A38]/50 backdrop-blur-sm p-4 rounded-xl flex items-center gap-3 cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ 
                                        scale: 1.1,
                                        backgroundColor: "rgba(30, 42, 56, 0.7)",
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{
                                        scale: {
                                            type: "spring",
                                            damping: 25,
                                            stiffness: 300,
                                            restDelta: 0.001
                                        }
                                    }}
                                >
                                    <Icon className="text-[#008B8B] text-xl" />
                                    <span className="text-white text-sm">{text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mt-8">
                            {[
                                { number: "10K+", label: "Movies" },
                                { number: "50K+", label: "Reviews" },
                                { number: "100K+", label: "Users" }
                            ].map(({ number, label }, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + (index * 0.1) }}
                                >
                                    <div className="text-[#008B8B] text-2xl font-bold">{number}</div>
                                    <div className="text-gray-400 text-sm">{label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {user && (
                            <div className="mt-8">
                                <h1 className="text-2xl font-bold">
                                    Hi, {user.name}!
                                </h1>
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('accessToken');
                                        localStorage.removeItem('refreshToken');
                                        window.location.href = '/login';
                                    }}
                                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                     
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Content - Poster Showcase */}
                    <div className="hidden lg:block relative w-[70%] h-[85vh] ml-[200px] overflow-hidden rounded-xl bg-[#1E2A38]/10 backdrop-blur-sm mt-1">
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#1E2A38]/60 to-transparent z-10" />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1E2A38]/60 to-transparent z-10" />
                        
                        <div className="relative w-full h-full flex items-center justify-center">
                            <motion.div 
                                key={currentPosterIndex}
                                className="relative w-[500px] h-[750px] rounded-xl overflow-hidden group"
                                initial={{ y: 800, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -800, opacity: 0 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    duration: 0.8
                                }}
                            >
                                <img 
                                    src={moviePosters[currentPosterIndex].url} 
                                    alt={moviePosters[currentPosterIndex].title}
                                    className="w-full h-full object-contain rounded-xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 p-6 w-full">
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {moviePosters[currentPosterIndex].title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <FaStar className="text-[#008B8B]" />
                                            <span className="text-white">
                                                {moviePosters[currentPosterIndex].rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Poster Indicators */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                            {moviePosters.map((_, index) => (
                                <motion.div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${index === currentPosterIndex ? 'bg-[#008B8B]' : 'bg-white/30'}`}
                                    whileHover={{ scale: 1.2 }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}