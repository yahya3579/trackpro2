"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spotlight } from "@/components/ui/spotlight";
import { GradientButton } from "@/components/ui/aceternity-button";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { AlertCircle, Check, Loader2 } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Missing reset token. Please request a new password reset link.");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired token');
        }

        setTokenValid(true);
        setUserEmail(data.email || '');
      } catch (error) {
        setError(error.message || "Invalid or expired token. Please request a new password reset link.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Clear form data
      setFormData({
        password: "",
        confirmPassword: "",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
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
                  {success ? "Password Reset" : "Create New Password"}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {isVerifying ? "Verifying your reset link..." : 
                   success ? "Your password has been reset successfully!" : 
                   tokenValid ? `Please create a new password for ${userEmail}` : 
                   "There was a problem with your reset link"}
                </p>
              </CardItem>
              
              {isVerifying ? (
                <CardItem translateZ={30} className="w-full mb-4">
                  <div className="flex flex-col items-center justify-center py-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    >
                      <Loader2 className="h-10 w-10 mb-4 text-primary" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Verifying your reset token...</p>
                  </div>
                </CardItem>
              ) : error ? (
                <CardItem translateZ={30} className="w-full mb-4">
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                        <Button 
                          asChild 
                          variant="link" 
                          className="px-0 text-sm text-red-600 hover:text-red-800"
                        >
                          <Link href="/forgot-password">Request a new reset link</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardItem>
              ) : success ? (
                <CardItem translateZ={30} className="w-full mb-4">
                  <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-md">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Success!</p>
                        <p className="text-sm">Your password has been reset successfully. You'll be redirected to login shortly.</p>
                      </div>
                    </div>
                  </div>
                </CardItem>
              ) : tokenValid ? (
                <form onSubmit={handleSubmit}>
                  <CardItem translateZ={30} className="w-full space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="border-muted-foreground/20 focus:border-primary/50 h-11 transition-all duration-200 bg-card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </GradientButton>
                  </CardItem>
                </form>
              ) : null}

              <CardItem translateZ={20} className="w-full mt-8 text-center">
                <p className="text-sm text-muted-foreground">
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