import { motion } from "framer-motion";

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-8">
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
            <p className="text-[#008B8B] mt-4 text-lg font-medium">
                Loading Movies...
            </p>
        </div>
    );
} 