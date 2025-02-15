import { motion } from "framer-motion";

export default function LoadingSpinner({ error, message = "Loading...", onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            {!error ? (
                <>
                    <div className="lds-roller text-[#008B8B]">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[#008B8B] mt-4 text-lg font-medium"
                    >
                        {message}
                    </motion.p>
                </>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="bg-red-500/10 p-4 rounded-lg mb-4">
                        <p className="text-red-500 text-lg font-medium mb-2">
                            {error}
                        </p>
                        <p className="text-red-400 text-sm">
                            Please try again or check your connection
                        </p>
                    </div>
                    {onRetry && (
                        <button 
                            onClick={onRetry}
                            className="px-4 py-2 bg-[#008B8B] text-white rounded-lg hover:bg-[#006666] transition-colors"
                        >
                            Retry
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
} 