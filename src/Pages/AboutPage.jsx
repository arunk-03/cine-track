import React, { memo } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { FaFilm, FaStar, FaUsers, FaCode } from "react-icons/fa";
import FloatingIcons from "../Components/FloatingIcons";
import NavBar from "../Components/NavBar";

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

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => {
    return (
        <div className="bg-[#1E2A38]/40 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <Icon className="text-[#008B8B] text-3xl mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    );
};

export default function AboutPage() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const radius = 400;

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative overflow-hidden pt-20">
            <Background />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    onMouseMove={handleMouseMove}
                    className="relative"
                >
                    {/* Gradient hover effect */}
                    <motion.div
                        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 duration-300 transition-opacity"
                        style={{
                            background: useMotionTemplate`
                                radial-gradient(
                                    ${radius}px circle at ${mouseX}px ${mouseY}px,
                                    rgba(0, 139, 139, 0.15),
                                    transparent 80%
                                )
                            `,
                        }}
                    />

                    <div className="bg-[#1E2A38]/30 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10 group">
                        {/* Hero Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                About MovieVault
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Your ultimate destination for discovering, tracking, and sharing your movie experiences. 
                                We're passionate about bringing the magic of cinema to every user.
                            </p>
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
                        >
                            <FeatureCard 
                                icon={FaFilm}
                                title="Extensive Collection"
                                description="Access thousands of movies across different genres, eras, and cultures. Our vast library ensures you'll always find something new to watch."
                            />
                            <FeatureCard 
                                icon={FaStar}
                                title="Personal Ratings"
                                description="Rate and review movies you've watched, creating your personal movie diary and helping others discover great films."
                            />
                            <FeatureCard 
                                icon={FaUsers}
                                title="Community Driven"
                                description="Join a vibrant community of movie enthusiasts. Share recommendations, discuss films, and discover hidden gems."
                            />
                            <FeatureCard 
                                icon={FaCode}
                                title="Modern Technology"
                                description="Built with cutting-edge technology to provide a smooth, responsive, and intuitive user experience across all devices."
                            />
                        </motion.div>

                        {/* Mission Statement */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                            <p className="text-gray-400 max-w-3xl mx-auto">
                                We're dedicated to creating the ultimate platform for movie lovers. 
                                Our goal is to make movie discovery and tracking a seamless, enjoyable experience 
                                while building a passionate community around the art of cinema.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
        </>
    );
} 