import React, { memo } from "react";
import { Label } from "../Components/Label";
import { Input } from "../Components/Input";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { FaLock, FaEnvelope, FaUser } from "react-icons/fa";
import FloatingIcons from "../Components/FloatingIcons";
import NavBar from "../Components/NavBar";
import ScrollReveal from "../Components/ScrollReveal";
import { Link } from "react-router-dom";

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

export default function SignupPage() {
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
        <div className="h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative overflow-hidden flex items-center justify-center pt-10">
            <Background />

            <ScrollReveal className="relative z-10 w-full max-w-md mx-4">
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
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-gray-400">Join us on your movie journey</p>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white/90">
                                    Full Name
                                </Label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#008B8B]" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your name"
                                        className="pl-10 bg-black/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white/90">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#008B8B]" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-10 bg-black/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white/90">
                                    Password
                                </Label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#008B8B]" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 bg-black/20"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-[#008B8B] hover:bg-[#008B8B]/90 text-white py-3 rounded-lg font-medium transition-colors"
                                type="submit"
                            >
                                Create Account
                            </motion.button>

                            <div className="mt-6 text-center text-white/70">
                                Already have an account?{" "}
                                <Link to="/login" className="text-[#008B8B] hover:text-[#008B8B]/80 font-medium">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </ScrollReveal>
        </div>
        </>
    );
} 