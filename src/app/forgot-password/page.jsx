"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spotlight } from "@/components/ui/spotlight";
import { GradientButton } from "@/components/ui/aceternity-button";
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      setSuccess(true);
    } catch (error) {
      setError(error.message || "Failed to send reset link. Please try again.");
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
                  Forgot Password
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Enter your email to receive a password reset link
                </p>
              </CardItem>

              {error && (
                <CardItem translateZ={30} className="w-full mb-4">
                  <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
                    {error}
                  </div>
                </CardItem>
              )}
              
              {success ? (
                <CardItem translateZ={30} className="w-full mb-4">
                  <div className="bg-green-50 text-green-600 p-4 rounded-md text-center border border-green-200">
                    <p className="font-medium">Reset link sent!</p>
                    <p className="text-sm mt-1">Check your email for instructions to reset your password.</p>
                  </div>
                </CardItem>
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardItem translateZ={30} className="w-full space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="Your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                    </GradientButton>
                  </CardItem>
                </form>
              )}

              <CardItem translateZ={20} className="w-full mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Back to login
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