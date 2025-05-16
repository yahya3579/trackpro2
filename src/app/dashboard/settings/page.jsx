"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageTemplate } from "../components/page-template";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Upload,
  KeyRound,
  Save,
  User,
  Mail,
  Lock,
  Shield,
  Image,
  Info,
  CheckCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";

// export const metadata = {
//   title: "Settings | TrackPro",
//   description: "Configure system settings and preferences",
// };

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  
  const { 
    id, 
    name, 
    email,
    photoUrl, 
    role,
    refreshProfile, 
    updateProfile, 
    getInitials 
  } = useOrganization();

  // Form schema for password update
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, {
      message: "Current password is required",
    }),
    newPassword: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  // Form schema for profile update
  const profileFormSchema = z.object({
    name: z.string().min(2, {
      message: "Organization name must be at least 2 characters",
    }),
  });

  // Set up password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Set up profile form
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Set initial form values when data is loaded
  useEffect(() => {
    if (name) {
      profileForm.setValue("name", name);
    }
  }, [name, profileForm]);

  // Handle password form submission
  const onPasswordSubmit = async (data) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/organization/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully",
          variant: "success",
        });
        passwordForm.reset();
      } else {
        toast({
          title: "Failed to update password",
          description: result.message || "Please check your current password and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating your password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile form submission
  const onProfileSubmit = async (data) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/organization/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: data.name,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update organization data in context
        updateProfile({ name: data.name });
        
        toast({
          title: "Profile updated",
          description: "Organization profile has been updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to update profile",
          description: result.message || "There was a problem updating your profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setProfileImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!profileImageFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);

      const response = await fetch('/api/organization/upload-photo', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update the organization context with the new photo URL
        updateProfile({ photoUrl: result.photoUrl });
        
        // Clear the preview and file state
        setProfileImagePreview(null);
        setProfileImageFile(null);
        
        toast({
          title: "Photo updated",
          description: "Organization profile photo has been updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to upload photo",
          description: result.message || "There was a problem uploading your photo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while uploading your photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageTemplate
      title="Organization Settings"
      description="Manage your organization profile, password, and preferences"
      iconName="Settings"
    >
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 shadow-lg bg-gradient-to-br from-blue-100/60 to-purple-100/40">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-primary text-xl">
                {getInitials(name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-primary drop-shadow-sm">{name || "Organization"}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{email}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-sm">
                <Shield className="h-3 w-3 mr-1" />
                {role === 'organization_admin' ? 'Administrator' : 'Organization'}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 shadow hover:shadow-md transition-all"
          onClick={refreshProfile}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Profile
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 md:w-[400px] bg-gradient-to-r from-blue-50/60 to-purple-50/40 rounded-xl shadow-sm">
          <TabsTrigger value="profile" className="flex items-center gap-2 text-base font-semibold">
            <Building className="h-4 w-4" />
            <span>Organization Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-border/60 shadow-lg rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                  <CardDescription>
                    Update your organization's basic information
                  </CardDescription>
                </CardHeader>
                <Separator className="mb-4" />
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              Organization Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter organization name" 
                                className="bg-background/50 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground/80">
                              This name will be displayed across the platform
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-2 gap-2 rounded-lg shadow hover:shadow-md transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border border-border/60 shadow-lg rounded-2xl bg-gradient-to-br from-white/90 to-purple-50/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    <CardTitle>Profile Photo</CardTitle>
                  </div>
                  <CardDescription>
                    Upload or update your organization's logo or profile photo
                  </CardDescription>
                </CardHeader>
                <Separator className="mb-4" />
                <CardContent className="flex flex-col items-center justify-center gap-5">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-2 border-border shadow-lg overflow-hidden transition-all bg-gradient-to-br from-blue-100/60 to-purple-100/40">
                      {profileImagePreview ? (
                        <AvatarImage src={profileImagePreview} alt="Profile preview" />
                      ) : (
                        <>
                          <AvatarImage src={photoUrl} alt="Profile" />
                          <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-500">
                            {getInitials(name)}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <label htmlFor="picture" className="cursor-pointer flex items-center justify-center w-full h-full">
                        <Upload className="h-8 w-8 text-white" />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full gap-3">
                    <div className="relative w-full flex flex-col items-center">
                      <input
                        id="picture"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="picture" className="w-full flex justify-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/90 text-white font-medium shadow hover:bg-blue-600 transition-all cursor-pointer">
                          <Upload className="h-5 w-5" />
                          {profileImageFile ? profileImageFile.name : "Choose File"}
                        </span>
                      </label>
                    </div>
                    <div className="w-full space-y-2">
                      <Button 
                        type="button" 
                        className="w-full gap-2 rounded-lg shadow hover:shadow-md transition-all"
                        onClick={handleImageUpload}
                        disabled={isLoading || !profileImageFile}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        <Info className="h-3 w-3 inline mr-1" />
                        Supported formats: JPEG, PNG, GIF (Max: 5MB)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-xl mx-auto border border-border/60 shadow-lg rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/40">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                  Secure your account with a strong password
                </CardDescription>
              </CardHeader>
              <Separator className="mb-4" />
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            Current Password
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="bg-background/50 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        New Password
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-background/50 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-background/50 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/5 text-blue-800 dark:text-blue-300 p-3 rounded-md flex items-start gap-2 mt-4 text-sm">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Password requirements:</p>
                        <ul className="list-disc list-inside mt-1 text-xs space-y-1 text-muted-foreground">
                          <li>At least 6 characters long</li>
                          <li>Use a mix of letters, numbers and symbols for stronger security</li>
                        </ul>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full mt-2 gap-2 rounded-lg shadow hover:shadow-md transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 bg-muted/20 flex items-center gap-2 text-sm text-muted-foreground rounded-b-2xl">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                For security reasons, you'll be asked to login again after changing your password.
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
} 