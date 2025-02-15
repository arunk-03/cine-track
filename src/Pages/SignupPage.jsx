import React, { memo, useState } from "react";
import { Label } from "../Components/Label";
import { Input } from "../Components/Input";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { FaLock, FaEnvelope, FaUser } from "react-icons/fa";
import FloatingIcons from "../Components/FloatingIcons";
import NavBar from "../Components/NavBar";
import ScrollReveal from "../Components/ScrollReveal";
import { Link } from "react-router-dom";
import { useToast } from "../Components/Toast";
import { useNavigate } from "react-router-dom";
import ToastContainer from "../Components/Toast";
import api from "../Backend/Context/api";
import "../index.css";

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

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/users/signup', {
                name,
                email,
                password
            });

            if (response.data) {
                addToast('Signup successful', 'success');
                navigate('/login');
            }
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage;
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = 'Signup failed. Please try again.';
            }
            
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            setName("");
            setEmail("");
            setPassword("");
        }
    };

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }



    return (
        <>
            
            <NavBar />
            <ToastContainer />
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

                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
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
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full h-[48px] rounded-lg text-white font-medium 
                                        ${isLoading 
                                            ? 'bg-[#008B8B]/50 cursor-not-allowed' 
                                            : 'bg-[#008B8B] hover:bg-[#008B8B]/90'
                                        } 
                                        transition-colors duration-200 relative flex items-center justify-center`}
                                >
                                    {isLoading ? 'Signing up...' : 'Sign Up'}
                                </button>

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