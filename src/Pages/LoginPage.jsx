"use client";
import React, { useState, memo } from "react";
import { Label } from "../Components/Label";
import { Input } from "../Components/Input";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { FaLock, FaEnvelope, FaCheck } from "react-icons/fa";
import FloatingIcons from "../Components/FloatingIcons";
import NavBar from "../Components/NavBar";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../Components/Toast";

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

export default function LoginPage() {
  const [isChecked, setIsChecked] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 400;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { addToast } = useToast();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log(data);
  
      if (response.ok) {
        addToast('Login successful', 'success');
        navigate('/'); 
      } else {
        addToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      console.log(err);
      addToast(err.message || 'Login failed', 'error');
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
    <div className="h-screen bg-gradient-to-br from-[#1E2A38] via-[#3C3F41] to-[#1E2A38] relative overflow-hidden flex items-center justify-center pt-10">
      <Background />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
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
                  rgba(0, 139, 139, 1),
                  transparent 80%
                )
              `,
            }}
          />

          <div className="bg-[#1E2A38]/30 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10 group">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm group/check cursor-pointer">
                  <div 
                    className={`w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center
                      ${isChecked 
                        ? 'bg-[#008B8B] border-transparent' 
                        : 'border-gray-400 hover:border-[#008B8B]'}`}
                    onClick={() => setIsChecked(!isChecked)}
                  >
                    <motion.div
                      initial={false}
                      animate={isChecked ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaCheck className="text-white text-sm" />
                    </motion.div>
                  </div>
                  <span className="text-white/70 group-hover/check:text-white/90">Remember me</span>
                </label>
                <a href="#" className="text-sm text-[#008B8B] hover:text-[#008B8B]/80">
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#008B8B] hover:bg-[#008B8B]/90 text-white py-3 rounded-lg font-medium transition-colors"
                type="submit"
              >
                Sign In
              </motion.button>

              <div className="mt-6 text-center text-white/70">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#008B8B] hover:text-[#008B8B]/80 font-medium">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
}
