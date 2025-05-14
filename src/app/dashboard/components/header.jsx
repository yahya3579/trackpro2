"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Menu, Settings, HelpCircle, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";

export function Header({ onMenuClick }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(3);
  const { 
    name: organizationName, 
    photoUrl, 
    isLoading, 
    getInitials 
  } = useOrganization();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-md">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-purple-500/10 via-primary/5 to-transparent pointer-events-none" />
      
      {/* Left side - mobile menu */}
      <div className="flex items-center z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="md:hidden mr-2 hover:bg-accent rounded-full"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      
      {/* Right side - settings and profile */}
      <div className="flex items-center gap-3 z-10">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent rounded-full h-9 w-9 transition-all duration-300"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </motion.div>
        
        <div className="h-6 w-px bg-border opacity-50" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-2 hover:bg-accent rounded-full transition-all duration-300"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar className="h-8 w-8 border border-primary/10 shadow-sm">
                  {photoUrl ? (
                    <AvatarImage src={photoUrl} alt={organizationName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-xs">
                      {getInitials(organizationName)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </motion.div>
              <span className="font-medium text-sm md:block max-w-[150px] truncate">
                {isLoading ? 'Loading...' : organizationName || 'Company Name'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl border-muted/80 shadow-lg bg-card/95 backdrop-blur-sm">
            <DropdownMenuLabel className="pt-3 pb-4">
              <div className="flex flex-col space-y-1 px-1">
                <p className="text-sm font-medium">{organizationName || 'Company Name'}</p>
                <p className="text-xs text-muted-foreground">Organization Account</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-muted/50" />
            <div className="p-1">
              <DropdownMenuItem 
                className="flex items-center gap-2 rounded-md cursor-pointer h-9 px-2"
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted/50 my-1" />
              <DropdownMenuItem 
                className="flex items-center gap-2 rounded-md cursor-pointer h-9 px-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 