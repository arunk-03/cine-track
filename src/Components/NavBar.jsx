import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createSlug } from '../utils';
import { 
    FaSearch,
    FaBars, 
    FaTimes,
    FaHome,
    FaCompass,
    FaBookmark,
    FaFilm,
    FaVideo,
    FaCamera,
    FaStar,
    FaTheaterMasks,
    FaUser,
    FaSignOutAlt,
    FaUserCircle
} from 'react-icons/fa';
import { UserContext } from '../Backend/Context/UserContext';
import { useToast } from '../Components/Toast';


const SearchInput = React.memo(({ isMobile = false }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef(null);

    const performSearch = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            // Search for both movies and TV shows
            const [movieResponse, tvResponse] = await Promise.all([
                fetch(`https://www.omdbapi.com/?apikey=${import.meta.env.VITE_API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie`),
                fetch(`https://www.omdbapi.com/?apikey=${import.meta.env.VITE_API_KEY}&s=${encodeURIComponent(searchTerm)}&type=series`)
            ]);

            const [movieData, tvData] = await Promise.all([
                movieResponse.json(),
                tvResponse.json()
            ]);
            
            const combinedResults = [];

            if (movieData.Response === "True" && Array.isArray(movieData.Search)) {
                combinedResults.push(...movieData.Search.map(item => ({ ...item, contentType: 'movie' })));
            }
            
            if (tvData.Response === "True" && Array.isArray(tvData.Search)) {
                combinedResults.push(...tvData.Search.map(item => ({ ...item, contentType: 'tv-show' })));
            }

           
            setResults(combinedResults
                .sort((a, b) => parseInt(b.Year) - parseInt(a.Year))
                .slice(0, 5)
            );
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const value = event.target.value;
        setQuery(value);
        
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (!value.trim()) {
            setResults([]);
            return;
        }

        searchTimeout.current = setTimeout(() => {
            performSearch(value);
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, []);

    const clearSearch = () => {
        setQuery('');
        setResults([]);
    };

    return (
        <div className={`relative ${isMobile ? 'px-3 py-2' : ''}`}>
            <FaSearch className={`absolute ${isMobile ? 'left-6' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search movies..."
                className={`bg-[#2A3B4D] text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#008B8B] ${isMobile ? 'w-full' : 'w-64'}`}
                autoComplete="off"
            />
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-[#1E2A38] rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                        {results.map((item) => (
                            <Link
                                key={item.imdbID}
                                to={`/${item.contentType === 'movie' ? 'movies' : 'tv-show'}/${createSlug(item.Title)}/${item.imdbID}`}
                                className="block px-4 py-2 text-white hover:bg-[#008B8B]/20 transition-colors"
                                onClick={clearSearch}
                            >
                                <div className="flex items-center gap-2">
                                    {item.Poster && item.Poster !== 'N/A' ? (
                                        <img 
                                            src={item.Poster}
                                            alt={item.Title}
                                            className="w-10 h-14 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center">
                                            <FaFilm className="text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium">{item.Title}</div>
                                        <div className="text-sm text-gray-400">
                                            {item.Year} • {item.contentType === 'movie' ? 'Movie' : 'TV Show'}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#008B8B] border-t-transparent"></div>
                </div>
            )}
        </div>
    );
});

export default function NavBar() {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const { addToast: showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { icon: FaHome, label: 'Home', href: '/' },
        { icon: FaCompass, label: 'Discover', href: '/discover' },
        { icon: FaBookmark, label: 'Watchlist', href: '/watchlist' },
        { icon: FaVideo, label: 'Backlog', href: '/backlog' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            showToast('Successfully logged out');
            navigate('/discover');
        } catch (error) {
            showToast('Error logging out');
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1E2A38]/80 backdrop-blur-lg border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E2A38]/95 via-[#2A3B4D]/95 to-[#1E2A38]/95 backdrop-blur-md">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-[#008B8B]/10 text-4xl"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -10, 0],
                            x: [-5, 5, -5],
                            rotate: [0, 180, 360],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        {[FaFilm, FaVideo, FaCamera, FaStar, FaTheaterMasks][i]}
                    </motion.div>
                ))}
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-white">
                            Cine<span className="text-[#008B8B]">Track</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {menuItems.map((item, index) => (
                            <motion.div key={index}>
                                <Link
                                    to={item.href}
                                    className="text-gray-300 hover:text-[#008B8B] flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <item.icon className="text-lg" />
                                    {item.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="p-2 rounded-full hover:bg-[#2A3441] transition-colors"
                                >
                                    <FaUserCircle className="w-6 h-6 text-gray-300 hover:text-[#008B8B]" />
                                </button>

                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 rounded-lg bg-[#2A3441] shadow-xl z-50"
                                        >
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#3A4451] transition-colors rounded-t-lg"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <FaUser className="w-4 h-4" />
                                                <span>Profile</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    setShowLogoutConfirm(true);
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-[#3A4451] transition-colors rounded-b-lg"
                                            >
                                                <FaSignOutAlt className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-[#008B8B] text-white px-4 py-2 rounded-lg hover:bg-[#007A7A] transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <motion.div 
                className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
                transition={{ duration: 0.2 }}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1E2A38]">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.href}
                            className="text-gray-300 hover:text-[#008B8B] flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium"
                        >
                            <item.icon className="text-lg" />
                            {item.label}
                        </Link>
                    ))}
                    <div className="relative px-3 py-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search movies..."
                                className="bg-[#2A3B4D] text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#008B8B] w-full"
                                autoComplete="off"
                            />
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#2A3441] p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Confirm Logout
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Are you sure you want to logout?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-[#008B8B] text-white rounded-lg hover:bg-[#007A7A] transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
