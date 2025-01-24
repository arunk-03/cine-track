import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    FaSearch, 
    FaUserCircle, 
    FaBars, 
    FaTimes,
    FaHome,
    FaCompass,
    FaBookmark,
    FaHeart,
    FaFilm,
    FaVideo,
    FaCamera,
    FaStar,
    FaTheaterMasks,
    FaSignInAlt,
    FaUserPlus
} from 'react-icons/fa';

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { icon: FaHome, label: 'Home', href: '/' },
        { icon: FaCompass, label: 'Discover', href: '/discover' },
        { icon: FaUserPlus, label: 'Sign Up', href: '/signup' },
        { icon: FaSignInAlt, label: 'Login', href: '/login' },
    ];

    return (
        <nav className="fixed w-full z-50">
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

                    {/* Desktop Navigation */}
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

                    {/* Search and Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                className="bg-[#2A3B4D] text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#008B8B] w-64"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[#008B8B] hover:text-[#008B8B]/80 text-2xl"
                        >
                            <FaUserCircle />
                        </motion.button>
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
                        <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="bg-[#2A3B4D] text-white w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#008B8B]"
                        />
                    </div>
                </div>
            </motion.div>
        </nav>
    );
}
