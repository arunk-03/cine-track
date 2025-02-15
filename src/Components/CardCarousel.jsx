"use client";;
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  FaTimes as IconX,
  FaArrowLeft as IconArrowNarrowLeft,
  FaArrowRight as IconArrowNarrowRight,
} from "react-icons/fa";
import { cn } from "../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { useToast } from './Toast';

export const CarouselContext = createContext({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }) => {
  const carouselRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Create one set of duplicates for smooth infinite scroll
  const extendedItems = [...items, ...items];

  useEffect(() => {
    if (!carouselRef.current) return;
    
    const handleScroll = () => {
      if (!carouselRef.current || isAutoScrolling) return;

      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const scrollEnd = scrollWidth - clientWidth;
      
      // Only reset position when actually reaching the end or start
      if (scrollLeft >= scrollEnd - 5) {
        setIsAutoScrolling(true);
        carouselRef.current.scrollLeft = 0;
        setTimeout(() => setIsAutoScrolling(false), 50);
      } else if (scrollLeft <= 5) {
        setIsAutoScrolling(true);
        carouselRef.current.scrollLeft = scrollEnd / 2;
        setTimeout(() => setIsAutoScrolling(false), 50);
      }
    };

    carouselRef.current.addEventListener('scroll', handleScroll);
    return () => carouselRef.current?.removeEventListener('scroll', handleScroll);
  }, [items.length, isAutoScrolling]);

  const scrollLeft = () => {
    if (!carouselRef.current || isScrolling || isAutoScrolling) return;
    
    setIsScrolling(true);
    carouselRef.current.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
    setTimeout(() => setIsScrolling(false), 500);
  };

  const scrollRight = () => {
    if (!carouselRef.current || isScrolling || isAutoScrolling) return;
    
    setIsScrolling(true);
    carouselRef.current.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
    setTimeout(() => setIsScrolling(false), 500);
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: () => {}, currentIndex }}>
      <div className="relative w-full group">
        <div
          ref={carouselRef}
          className="flex w-full overflow-x-scroll overscroll-x-auto py-6 md:py-10 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex flex-row justify-start gap-3 md:gap-4 pl-2 md:pl-4">
            {extendedItems.map((item, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  hoveredIndex !== null && hoveredIndex !== index 
                    ? 'lg:blur-sm lg:opacity-50 lg:scale-95' 
                    : ''
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-4 bottom-2 flex gap-2 z-50">
          <button
            type="button"
            onClick={scrollLeft}
            disabled={isScrolling || isAutoScrolling}
            className="h-9 w-9 rounded-full bg-[#008B8B]/20 hover:bg-[#008B8B]/30 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <IconArrowNarrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            disabled={isScrolling || isAutoScrolling}
            className="h-9 w-9 rounded-full bg-[#008B8B]/20 hover:bg-[#008B8B]/30 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <IconArrowNarrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({ card, index, layout = false }) => {
  const [open, setOpen] = useState(false);
  const [fullPlot, setFullPlot] = useState('');
  const [showActions, setShowActions] = useState(false);
  const actionRef = useRef(null);
  const containerRef = useRef(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);
  const { showToast } = useToast();

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(false);
    showToast(`Added "${card.title}" to wishlist`);
  };

  const handleWatched = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(false);
    showToast(`Added "${card.title}" to backlog`);
  };

  const handleOpen = async () => {
    setOpen(true);
    // Fetch full plot when modal opens
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=a0c4e62f&i=${card.imdbID}&plot=full`
      );
      const data = await response.json();
      if (data.Plot) {
        setFullPlot(data.Plot);
      }
    } catch (error) {
      console.error('Failed to fetch full plot:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const ActionButton = () => (
    <div 
      ref={actionRef}
      className="absolute top-2 right-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
    

      {showActions && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-[#1E2A38] rounded-xl shadow-lg border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={handleWatchlist}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#008B8B]/20 flex items-center gap-2"
          >
            <span>❤️</span> Add to Wishlist
          </button>
          <button
            type="button"
            onClick={handleWatched}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#008B8B]/20 flex items-center gap-2"
          >
            <span>✓</span> Add to Backlog
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-50 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-5xl mx-auto bg-[#1E2A38] h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative mt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-0 right-4 h-8 w-8 bg-[#008B8B] rounded-full flex items-center justify-center hover:bg-[#008B8B]/90 transition-colors mt-2"
              >
                <IconX className="h-5 w-5 text-white" />
              </button>

              <ActionButton />

              <div className="flex flex-col md:flex-row gap-8 mt-8">
                <div className="w-full md:w-1/3">
                  {card.src !== 'N/A' ? (
                    <img
                      src={card.src}
                      alt={card.title}
                      className="w-full h-[400px] object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-[400px] bg-[#1E2A38] rounded-2xl flex items-center justify-center text-gray-400 text-lg font-medium border border-gray-700">
                      NO POSTER AVAILABLE
                    </div>
                  )}
                </div>

                <div className="w-full md:w-2/3">
                  <motion.p
                    layoutId={layout ? `category-${card.title}` : undefined}
                    className="text-[#008B8B] text-sm md:text-base font-medium"
                  >
                    {card.category}
                  </motion.p>
                  <motion.h2
                    layoutId={layout ? `title-${card.title}` : undefined}
                    className="text-2xl md:text-4xl font-bold text-white mt-2"
                  >
                    {card.title}
                  </motion.h2>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      {card.details?.map((detail, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          {detail}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed">
                      {fullPlot || card.content}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {card.genres?.map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#008B8B]/20 text-[#008B8B] rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <motion.div className="relative">
        <motion.button
          type="button"
          layoutId={layout ? `card-${card.title}` : undefined}
          onClick={handleOpen}
          className="group rounded-2xl bg-[#1E2A38] h-60 w-44 md:h-[26rem] md:w-64 overflow-hidden flex flex-col items-start justify-start relative z-10"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <ActionButton />

          {/* Card Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          
          <div className="relative z-30 p-6 h-full flex flex-col justify-end">
            <motion.p
              layoutId={layout ? `category-${card.category}` : undefined}
              className="text-white text-sm md:text-base font-medium text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {card.category}
            </motion.p>
            <motion.p
              layoutId={layout ? `title-${card.title}` : undefined}
              className="text-white text-lg md:text-2xl font-semibold max-w-xs text-left mt-2"
            >
              {card.title}
            </motion.p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
              <p className="text-gray-300 text-sm line-clamp-3">
                {card.content}
              </p>
            </div>
          </div>
          
          {card.src !== 'N/A' ? (
            <img
              src={card.src}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#1E2A38] flex items-center justify-center text-gray-400 text-lg font-medium z-0">
              NO POSTER AVAILABLE
            </div>
          )}
        </motion.button>
      </motion.div>
    </>
  );
};