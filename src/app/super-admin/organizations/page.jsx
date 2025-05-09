"use client";

import { 
  Building, 
  PlusCircle, 
  Search 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrganizationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Organizations</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Organizations</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search organizations..." 
                className="pl-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((org, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-slate-700 text-blue-400">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-slate-400">{org.users} users • {org.plan}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700" size="sm">
                    View
                  </Button>
                  <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sample organizations data
const organizations = [
  { name: "TechCorp Inc.", users: 125, plan: "Enterprise" },
  { name: "MetaSync Ltd.", users: 87, plan: "Business" },
  { name: "DataFlow Solutions", users: 56, plan: "Business" },
  { name: "Quantum Innovations", users: 204, plan: "Enterprise" },
  { name: "CyberTech Systems", users: 43, plan: "Standard" },
]; 