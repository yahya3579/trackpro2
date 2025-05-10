"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toast } from 'sonner';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5); // 5 second countdown
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing invitation token');
      return;
    }
    
    const acceptInvitation = async () => {
      try {
        const response = await fetch('/api/employees/accept-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to accept invitation');
        }
        
        setStatus('success');
        setMessage('Invitation accepted successfully');
        setEmployeeData(data.employee);
        
        // Store the employee info locally if returned
        if (data.employee) {
          localStorage.setItem('accepted_employee', JSON.stringify({
            id: data.employee.id,
            name: data.employee.name,
            email: data.employee.email,
            organization: data.employee.organization
          }));
        }
        
        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setRedirectCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Redirect to employees dashboard
              router.push('/dashboard/employees?invitation=accepted');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Clean up interval
        return () => clearInterval(countdownInterval);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'An error occurred while accepting the invitation');
        toast.error(`Error: ${error.message}`);
      }
    };
    
    // Wait a bit for better UX to show loading state
    const timer = setTimeout(() => {
      acceptInvitation();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [searchParams, router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Employee Invitation</CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Processing your invitation...' : (
              status === 'success' ? 'Welcome to TrackPro!' : 'Invitation Error'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-6">
            {status === 'loading' && (
              <>
                <div className="animate-spin mb-4">
                  <Loader2 size={48} className="text-primary" />
                </div>
                <p>Verifying your invitation...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="text-green-600 dark:text-green-400 mb-4">
                  <CheckCircle2 size={56} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Invitation Accepted!</h3>
                <p className="mb-4">
                  Welcome to the team, {employeeData?.name}! Your account has been successfully activated.
                </p>
                {employeeData?.organization && (
                  <p className="text-sm bg-muted/50 p-3 rounded-md">
                    You have joined <strong>{employeeData.organization}</strong> on TrackPro.
                  </p>
                )}
                <div className="mt-6 text-sm text-muted-foreground">
                  <p>Redirecting to employees dashboard in {redirectCountdown} seconds...</p>
                </div>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <AlertCircle size={56} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
                <p className="text-muted-foreground">{message || 'Unable to process your invitation'}</p>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === 'success' && (
            <Button onClick={() => router.push('/dashboard/employees?invitation=accepted')}>
              Go to Employees Dashboard
            </Button>
          )}
          
          {status === 'error' && (
            <Button variant="outline" onClick={() => router.push('/')}>
              Return to Homepage
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 