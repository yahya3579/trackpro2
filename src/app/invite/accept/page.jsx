"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  Mail, 
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building,
  Briefcase,
  Shield
} from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Separator } from "@/components/ui/separator";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Load and validate the invitation token
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError('Invalid invitation link. Please check your email for the correct link.');
        setIsLoading(false);
        return;
      }
      
      try {
        // Make sure we pass the token exactly as received from the URL
        const response = await fetch(`/api/invite/validate?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          console.error('Token validation failed:', data.error);
          if (data.error === 'Employee has already activated their account') {
            setError('This invitation has already been accepted. Please proceed to the login page.');
          } else if (data.error === 'Token has expired') {
            setError('This invitation link has expired. Please contact your administrator for a new invitation.');
          } else {
            setError(data.error || 'Invalid or expired invitation link.');
          }
        } else {
          setEmployeeData(data.employee);
        }
      } catch (error) {
        console.error('Error validating invitation:', error);
        setError('Failed to validate invitation. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    validateToken();
  }, [token]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to accept invitation.');
        setIsSubmitting(false);
      } else {
        // Store employee data temporarily in localStorage to show on the login page
        localStorage.setItem('accepted_employee', JSON.stringify(data.employee));
        
        // Show success message first, then redirect after a short delay
        setIsSubmitting(false);
        setSuccessMessage('Your account has been successfully created! You will be redirected to the login page.');
        
        // Redirect to login page with success flag after a short delay
        setTimeout(() => {
          router.push('/login?invitation=accepted');
        }, 2000);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation. Please try again later.');
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="mt-6 text-base font-medium text-muted-foreground">Validating your invitation...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !employeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
        <BackgroundGradient className="w-full max-w-md rounded-[22px] p-[1px]">
          <Card className="w-full border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-6 rounded-full bg-red-100 p-4 text-red-600">
                <AlertCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {error.includes('already been accepted') ? 'Already Activated' : 'Invalid Invitation'}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-base">
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
              {error.includes('already been accepted') ? (
                <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
                  Go to Login
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={() => router.push('/')}>
                  Return to Home
                </Button>
              )}
            </CardFooter>
          </Card>
        </BackgroundGradient>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <BackgroundGradient className="w-full max-w-md rounded-[22px] p-[1px]">
        <Card className="w-full border-0">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white">
                <Shield className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to TrackPro</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {employeeData?.name}, please create a password to complete your account setup.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <Alert variant="destructive" className="animate-pulse">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {successMessage && (
                <Alert variant="success" className="bg-green-50 border-green-200 text-green-800 animate-pulse">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="rounded-md bg-muted/50 p-4 space-y-5 border border-muted">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={employeeData?.name || ''}
                      className="pl-10 bg-background/60 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                      disabled
                    />
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={employeeData?.email || ''}
                      className="pl-10 bg-background/60 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                      disabled
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">Role</Label>
                  <div className="relative">
                    <Input
                      id="role"
                      value={employeeData?.role || ''}
                      className="pl-10 bg-background/60 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                      disabled
                    />
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="team" className="text-sm font-medium text-muted-foreground">Team</Label>
                  <div className="relative">
                    <Input
                      id="team"
                      value={employeeData?.team || ''}
                      className="pl-10 bg-background/60 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                      disabled
                    />
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <Separator className="bg-muted/70" />
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-1">
                  Create Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10 bg-background/60 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-1">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 bg-background/60 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 pb-6">
              <Button
                type="submit"
                className="w-full relative overflow-hidden group"
                size="lg"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full bg-gradient-to-r from-primary/60 to-primary group-hover:translate-x-0"></span>
                <span className="relative flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Accept Invitation & Create Account
                    </>
                  )}
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </BackgroundGradient>
    </div>
  );
} 