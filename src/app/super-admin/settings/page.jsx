"use client";

import { Settings, Shield, Database, BellRing, Globe, Lock, Mail, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SuperAdminManagement } from "./super-admin-management";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Configure system settings and manage super admin access
        </p>
      </div>

      <div className="grid gap-8">
        <SuperAdminManagement />
      </div>
    </div>
  );
} 