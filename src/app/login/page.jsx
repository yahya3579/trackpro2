"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spotlight } from "@/components/ui/spotlight";
import { PulseButton, GradientButton } from "@/components/ui/aceternity-button";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Always redirect to dashboard, regardless of role
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background overflow-hidden p-4">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="purple"
      />
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full"
        >
          <CardContainer className="w-full h-full">
            <CardBody className="relative bg-card/80 backdrop-blur-sm border rounded-xl shadow-lg p-6">
              <CardItem translateZ={50} className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-gradient-to-r from-primary to-purple-600 p-3">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  Welcome Back
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Log in to your TrackPro account
                </p>
              </CardItem>

              {error && (
                <CardItem translateZ={30} className="w-full mb-4">
                  <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                    {error}
                  </div>
                </CardItem>
              )}

              <form onSubmit={handleSubmit}>
                <CardItem translateZ={30} className="w-full space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="Your email" 
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      className="border-muted-foreground/20 focus:border-primary/50 h-11 transition-all duration-200 bg-card"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password"
                        placeholder="Password"
                        type={showPassword ? "text" : "password"} 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                        className="border-muted-foreground/20 focus:border-primary/50 h-11 transition-all duration-200 bg-card pr-16"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors rounded-r-md"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </CardItem>

                <CardItem translateZ={30} className="w-full mt-6">
                  <GradientButton 
                    type="submit" 
                    className="w-full h-12"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </GradientButton>
                </CardItem>
              </form>

              <CardItem translateZ={20} className="w-full mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Sign up
                  </Link>
                </p>
              </CardItem>
            </CardBody>
          </CardContainer>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none"></div>
    </div>
  );
} 