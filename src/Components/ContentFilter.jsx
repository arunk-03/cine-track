import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilm, FiTv, FiChevronDown } from 'react-icons/fi';
import { FaLayerGroup } from 'react-icons/fa';
import React from 'react';

const ContentFilter = ({ currentFilter, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { id: 'all', label: 'All', icon: FaLayerGroup },
    { id: 'movie', label: 'Movies', icon: FiFilm },
    { id: 'tv-show', label: 'TV Shows', icon: FiTv }
  ];

  const getCurrentFilter = () => {
    return filters.find(filter => filter.id === currentFilter) || filters[0];
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#2A3441]/80 backdrop-blur-sm rounded-lg 
                   text-gray-300 hover:text-white transition-colors duration-300 shadow-lg"
      >
        <span className="flex items-center gap-2">
          {React.createElement(getCurrentFilter().icon, { className: "w-4 h-4" })}
          <span className="text-sm font-medium">{getCurrentFilter().label}</span>
        </span>
        <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 rounded-lg bg-[#2A3441] shadow-xl z-50"
            >
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    onFilterChange(filter.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors duration-300
                    ${currentFilter === filter.id 
                      ? 'bg-[#008B8B] text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#3A4451]'
                    }
                    ${filter.id === 'all' ? 'rounded-t-lg' : ''}
                    ${filter.id === 'tv-show' ? 'rounded-b-lg' : ''}
                  `}
                >
                  {React.createElement(filter.icon, { className: "w-4 h-4" })}
                  <span>{filter.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentFilter; 