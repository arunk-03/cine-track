import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function TypewriterText({ phrases = [], className = "" }) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseDuration = 2000;

        if (phrases.length === 0) return;

        const currentPhrase = phrases[currentPhraseIndex];

        const timer = setTimeout(() => {
            if (!isDeleting) {
                if (currentText.length < currentPhrase.length) {
                    setCurrentText(currentPhrase.slice(0, currentText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseDuration);
                }
            } else {
                if (currentText.length > 0) {
                    setCurrentText(currentText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }
        }, isDeleting ? deleteSpeed : typeSpeed);

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentPhraseIndex, phrases]);

    return (
        <span className={className}>
            {currentText}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="inline-block w-[2px] h-[1em] bg-[#008B8B] align-middle ml-1"
            />
        </span>
    );
} 