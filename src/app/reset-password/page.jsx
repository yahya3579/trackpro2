"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Check, Loader2 } from "lucide-react";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-blue-600 p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center">
              {success ? "Password Reset" : "Create New Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {isVerifying ? "Verifying your reset link..." : 
               success ? "Your password has been reset successfully!" : 
               tokenValid ? `Please create a new password for ${userEmail}` : 
               "There was a problem with your reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
                <p className="text-sm text-slate-600">Verifying your reset token...</p>
              </div>
            ) : error ? (
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
            ) : success ? (
              <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-md">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Success!</p>
                    <p className="text-sm">Your password has been reset successfully. You'll be redirected to login shortly.</p>
                  </div>
                </div>
              </div>
            ) : tokenValid ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
                  </Button>
                </div>
              </form>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-slate-600">
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 