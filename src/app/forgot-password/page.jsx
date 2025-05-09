"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      const response = await fetch('http://localhost:5000/api/auth/request-reset', {
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
            <CardTitle className="text-3xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success ? (
              <div className="bg-green-50 text-green-600 p-4 rounded-md text-center">
                <p className="font-medium">Reset link sent!</p>
                <p className="text-sm mt-1">Check your email for instructions to reset your password.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-center block">Enter email here</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="Your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Reset Account Password'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-slate-600">
              <Link href="/login" className="text-blue-600">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 