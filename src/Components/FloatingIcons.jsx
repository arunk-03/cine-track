import { motion } from 'framer-motion';
import { 
    FaFilm, 
    FaVideo, 
    FaCamera, 
    FaStar, 
    FaTheaterMasks, 
    FaTv, 
    FaTicketAlt, 
    FaPlayCircle 
} from 'react-icons/fa';

export default function FloatingIcons({ 
    iconColor = "text-[#008B8B]", 
    iconOpacity = "50",
    iconCount = 15,
    className = "" 
}) {
    const icons = [FaFilm, FaVideo, FaCamera, FaStar, FaTheaterMasks, FaTv, FaTicketAlt, FaPlayCircle];

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {[...Array(iconCount)].map((_, i) => {
                const IconComponent = icons[i % icons.length];
                const size = Math.random() * 1 + 1;
                const duration = Math.random() * 10 + 15;
                
                return (
                    <motion.div
                        key={i}
                        className={`absolute ${iconColor}/${iconOpacity} text-[2rem]`}
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            scale: size,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            x: [-10, 10, -10],
                            rotate: [0, 360],
                            opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "linear",
                            times: [0, 0.5, 1],
                            rotate: {
                                duration: duration / 2,
                                ease: "linear",
                                repeat: Infinity
                            }
                        }}
                    >
                        <IconComponent />
                    </motion.div>
                );
            })}
        </div>
    );
} 