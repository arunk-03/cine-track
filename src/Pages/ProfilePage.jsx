import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { FaClock, FaEnvelope, FaUser, FaFilm, FaStar } from "react-icons/fa";
import NavBar from "../Components/NavBar";
import FloatingIcons from "../Components/FloatingIcons";
import api from "../Backend/Context/api";

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

// Circular Progress component
const CircularProgress = ({ value, total, label, icon: Icon }) => {
  const percentage = (value / total) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-[#008B8B]"
          />
        </svg>
        {/* Icon and value in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Icon className="text-2xl mb-1 text-[#008B8B]" />
          <span className="text-lg font-bold">{value}</span>
        </div>
      </div>
      <span className="mt-3 text-gray-400 text-sm">{label}</span>
    </div>
  );
};

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008B8B]"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative pt-20">
        <Background />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#008B8B] to-teal-400 mb-2">
              My Profile
            </h1>
            <p className="text-gray-400 text-base">
              Your movie watching statistics and details
            </p>
          </motion.div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#1E2A38] p-6 rounded-xl shadow-lg"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-[#008B8B] rounded-full flex items-center justify-center mb-4">
                  <FaUser className="text-4xl text-white" />
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">{userProfile?.name}</h2>
                <div className="flex items-center text-gray-400 mb-4">
                  <FaEnvelope className="mr-2" />
                  <span>{userProfile?.email}</span>
                </div>
                <div className="w-full h-px bg-gray-700 my-4" />
                <div className="text-gray-400 text-sm">
                  Member since: {new Date(userProfile?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              <div className="bg-[#1E2A38] p-6 rounded-xl shadow-lg flex justify-center">
                <CircularProgress
                  value={Math.floor(userProfile?.totalWatchTime / 60) || 0}
                  total={1000}
                  label="Watch Hours"
                  icon={FaClock}
                />
              </div>
              <div className="bg-[#1E2A38] p-6 rounded-xl shadow-lg flex justify-center">
                <CircularProgress
                  value={userProfile?.moviesWatched || 0}
                  total={100}
                  label="Movies Watched"
                  icon={FaFilm}
                />
              </div>
              <div className="bg-[#1E2A38] p-6 rounded-xl shadow-lg flex justify-center">
                <CircularProgress
                  value={userProfile?.averageRating || 0}
                  total={5}
                  label="Avg Rating"
                  icon={FaStar}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
} 