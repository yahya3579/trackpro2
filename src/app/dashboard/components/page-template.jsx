"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";

export function PageTemplate({ 
  title, 
  description, 
  iconName, 
  actions, 
  children 
}) {
  // Dynamically get the icon component based on the icon name
  const Icon = iconName ? LucideIcons[iconName] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="rounded-lg p-2 bg-slate-800 text-blue-400">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            {description && (
              <p className="text-slate-900">{description}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
} 