"use client";

import { 
  UserPlus, 
  Search,
  User,
  Shield,
  Mail,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search users..." 
                className="pl-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="text-white">
            <TableHeader className="bg-slate-800/50">
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Organization</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Contact</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow key={i} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p>{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.organization}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.role === "Super Admin" && <Shield className="h-3 w-3 text-blue-400" />}
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      user.status === "Active" 
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                    }>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Sample users data
const users = [
  { 
    name: "John Smith", 
    email: "john.smith@techcorp.com", 
    organization: "TechCorp Inc.", 
    role: "Admin", 
    status: "Active" 
  },
  { 
    name: "Sarah Johnson", 
    email: "sarah@metasync.com", 
    organization: "MetaSync Ltd.", 
    role: "Admin", 
    status: "Active" 
  },
  { 
    name: "Mike Anderson", 
    email: "mike@dataflow.com", 
    organization: "DataFlow Solutions", 
    role: "Employee", 
    status: "Inactive" 
  },
  { 
    name: "Admin User", 
    email: "admin@trackpro.com", 
    organization: "TrackPro", 
    role: "Super Admin", 
    status: "Active" 
  },
  { 
    name: "Jessica Lee", 
    email: "jessica@quantum.com", 
    organization: "Quantum Innovations", 
    role: "Manager", 
    status: "Active" 
  },
]; 