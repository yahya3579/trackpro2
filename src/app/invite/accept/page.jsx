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
  Briefcase
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

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
      
      console.log('Validating token:', token.substring(0, 20) + '...');
      
      try {
        // Make sure we pass the token exactly as received from the URL
        const response = await fetch(`/api/invite/accept?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (!response.ok || !data.success) {
          console.error('Token validation failed:', data.error);
          if (data.error === 'Employee has already activated their account') {
            setError('This invitation has already been accepted. Please proceed to the login page.');
          } else if (data.error === 'Employee not found with the email in the invitation') {
            setError('Employee record not found. Please contact your administrator.');
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
        
        // Redirect to login page with success flag
        router.push('/login?invitation=accepted');
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !employeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full bg-red-100 p-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">
              {error.includes('already been accepted') ? 'Already Activated' : 'Invalid Invitation'}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            {error.includes('already been accepted') ? (
              <Button className="w-full" onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            ) : (
              <Button className="w-full" onClick={() => router.push('/')}>
                Return to Home
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {/* Replace with your logo */}
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
              <User className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-xl mb-1">Welcome to TrackPro</CardTitle>
          <CardDescription>
            {employeeData?.first_name}, please create a password to complete your account setup.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={`${employeeData?.first_name || ''} ${employeeData?.last_name || ''}`}
                  className="pl-10"
                  disabled
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  value={employeeData?.email || ''}
                  className="pl-10"
                  disabled
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <div className="relative">
                <Input
                  id="position"
                  value={employeeData?.position || ''}
                  className="pl-10"
                  disabled
                />
                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Input
                  id="department"
                  value={employeeData?.department || ''}
                  className="pl-10"
                  disabled
                />
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={employeeData?.organization || ''}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                Create Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
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
              <Label htmlFor="confirm-password">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Accept Invitation & Create Account"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 