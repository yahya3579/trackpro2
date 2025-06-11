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

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
                  Create Account
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Enter your organization details to create your TrackPro account
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
                    <Label htmlFor="name" className="text-foreground font-medium">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Acme Inc." 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                      className="border-muted-foreground/20 focus:border-primary/50 h-11 transition-all duration-200 bg-card"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-muted-foreground/20 focus:border-primary/50 h-11 transition-all duration-200 bg-card"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="border-muted-foreground/20 focus:border-primary/50 h-11 transition-all duration-200 bg-card"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="border-muted-foreground/20 focus:border-primary/50 h-11 transition-all duration-200 bg-card"
                    />
                  </div>
                </CardItem>

                <CardItem translateZ={30} className="w-full mt-6">
                  <GradientButton 
                    type="submit" 
                    className="w-full h-12"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </GradientButton>
                </CardItem>
              </form>

              <CardItem translateZ={20} className="w-full mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Sign in
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