"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
            <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Log in to your TrackPro account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Your email" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password"
                      placeholder="password"
                      type={showPassword ? "text" : "password"} 
                      value={formData.password}
                      onChange={handleChange}
                      required 
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <CardFooter className="flex justify-center">
            <p className="text-xl text-slate-900 mt-8 font-semibold">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600">
                Sign up
              </Link>
            </p>
          </CardFooter>
    </div>
  );
} 