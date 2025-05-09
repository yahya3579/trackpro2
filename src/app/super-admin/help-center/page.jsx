"use client";

import { HelpCircle, Search, ChevronRight, Book, FileText, Mail, MessageSquare, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HelpCenterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Help Center</h1>
      
      {/* Search section */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 max-w-lg mx-auto">
            <HelpCircle className="h-12 w-12 text-blue-400 mx-auto" />
            <h2 className="text-2xl font-bold">How can we help you?</h2>
            <p className="text-slate-400">
              Search our knowledge base or browse categories below
            </p>
            <div className="relative mt-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search for help articles..." 
                className="pl-10 py-6 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
              <Button className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Documentation categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800/70 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-blue-900/30 text-blue-400">
                <Book className="h-5 w-5" />
              </div>
              <CardTitle>Getting Started</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-slate-400 pb-2">
            Learn about system setup, configuration, and initial setup guides.
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              <span>View articles</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800/70 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-amber-900/30 text-amber-400">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle>User Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-slate-400 pb-2">
            Learn how to manage users, roles, permissions, and organization settings.
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              <span>View articles</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800/70 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-emerald-900/30 text-emerald-400">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle>Billing & Invoicing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-slate-400 pb-2">
            Learn about billing cycles, invoices, payment methods, and subscription management.
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              <span>View articles</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800/70 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-rose-900/30 text-rose-400">
                <PhoneCall className="h-5 w-5" />
              </div>
              <CardTitle>Technical Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-slate-400 pb-2">
            Troubleshooting guides, common issues, and how to contact technical support.
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              <span>View articles</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800/70 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-violet-900/30 text-violet-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <CardTitle>API Documentation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-slate-400 pb-2">
            API reference, integration guides, and developer resources.
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              <span>View articles</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Contact support */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription className="text-slate-400">
            Need additional help? Our support team is here for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="justify-start py-6 bg-slate-800 hover:bg-slate-700">
            <Mail className="h-5 w-5 mr-2" />
            Email Support
          </Button>
          <Button className="justify-start py-6 bg-slate-800 hover:bg-slate-700">
            <MessageSquare className="h-5 w-5 mr-2" />
            Live Chat
          </Button>
          <Button className="justify-start py-6 bg-slate-800 hover:bg-slate-700">
            <PhoneCall className="h-5 w-5 mr-2" />
            Phone Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 