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

export const CarouselContext = createContext({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({
  items,
  initialScroll = 0
}) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index) => {
    if (carouselRef.current) {
      const cardWidth = window.innerWidth < 768 ? 230 : 384;
      const gap = window.innerWidth < 768 ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-10 md:py-20 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          ref={carouselRef}
          onScroll={checkScrollability}>
          <div
            className={cn(
              "absolute right-0  z-[1000] h-auto  w-[5%] overflow-hidden bg-gradient-to-l"
            )}></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              // remove max-w-4xl if you want the carousel to span the full width of its container
              "max-w-7xl mx-auto"
            )}>
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  },
                }}
                key={`card-${index}`}
                className="last:pr-[5%] md:last:pr-[33%]  rounded-3xl">
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mr-10">
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-[#008B8B]/20 hover:bg-[#008B8B]/30 flex items-center justify-center disabled:opacity-50 text-white"
            onClick={scrollLeft}
            disabled={!canScrollLeft}>
            <IconArrowNarrowLeft className="h-6 w-6" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-[#008B8B]/20 hover:bg-[#008B8B]/30 flex items-center justify-center disabled:opacity-50 text-white"
            onClick={scrollRight}
            disabled={!canScrollRight}>
            <IconArrowNarrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (<>
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 h-screen z-50 overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={containerRef}
            layoutId={layout ? `card-${card.title}` : undefined}
            className="max-w-5xl mx-auto bg-[#1E2A38] h-fit  z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative">
            <button
              className="sticky top-4 h-8 w-8 right-0 ml-auto bg-[#008B8B] rounded-full flex items-center justify-center"
              onClick={handleClose}>
              <IconX className="h-6 w-6 text-white" />
            </button>
            <motion.p
              layoutId={layout ? `category-${card.title}` : undefined}
              className="text-base font-medium text-white">
              {card.category}
            </motion.p>
            <motion.p
              layoutId={layout ? `title-${card.title}` : undefined}
              className="text-2xl md:text-5xl font-semibold text-white mt-4">
              {card.title}
            </motion.p>
            <div className="py-10 text-white">{card.content}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    <motion.button
      layoutId={layout ? `card-${card.title}` : undefined}
      onClick={handleOpen}
      className="group rounded-3xl bg-[#1E2A38] h-64 w-48 md:h-[28rem] md:w-72 overflow-hidden flex flex-col items-start justify-start relative z-10"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
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
      
      <img
        src={card.src}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 group-hover:scale-110"
      />
    </motion.button>
  </>);
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}) => {
  const [isLoading, setLoading] = useState(true);
  return (
    (<Image
      className={cn("transition duration-300", isLoading ? "blur-sm" : "blur-0", className)}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest} />)
  );
};
