"use client";

import { 
  CreditCard, 
  DollarSign,
  RefreshCcw,
  Calendar,
  BarChart3,
  TrendingUp,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Billing & Subscriptions</h1>
      
      {/* Billing overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Monthly Revenue</CardTitle>
              <div className="rounded-lg bg-slate-800 p-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,450</div>
            <div className="flex items-center mt-1 text-emerald-400 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +24% from last month
            </div>
            <div className="text-xs text-slate-400 mt-4">
              Updated 2 hours ago
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Active Subscriptions</CardTitle>
              <div className="rounded-lg bg-slate-800 p-2">
                <RefreshCcw className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28</div>
            <div className="flex items-center mt-1 text-emerald-400 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +7% from last month
            </div>
            <div className="text-xs text-slate-400 mt-4">
              5 pending renewals
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Next Billing Date</CardTitle>
              <div className="rounded-lg bg-slate-800 p-2">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">June 15</div>
            <div className="text-sm text-slate-400 mt-1">
              4 organizations scheduled
            </div>
            <div className="text-xs text-slate-400 mt-4">
              Estimated total: $4,750
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent transactions */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription className="text-slate-400">
              Recent billing activities across all organizations
            </CardDescription>
          </div>
          <Button className="border-slate-700 text-white hover:text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table className="text-white">
            <TableHeader className="bg-slate-800/50">
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-slate-400">Organization</TableHead>
                <TableHead className="text-slate-400">Plan</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, i) => (
                <TableRow key={i} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="font-medium">{transaction.organization}</TableCell>
                  <TableCell>{transaction.plan}</TableCell>
                  <TableCell>${transaction.amount}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Badge className={
                      transaction.status === "Successful" 
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : transaction.status === "Pending" 
                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                        : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    }>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700" size="sm">
                      View
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

// Sample transactions data
const transactions = [
  { 
    organization: "TechCorp Inc.", 
    plan: "Enterprise", 
    amount: "1,200", 
    date: "Jun 1, 2023", 
    status: "Successful" 
  },
  { 
    organization: "MetaSync Ltd.", 
    plan: "Business", 
    amount: "599", 
    date: "May 28, 2023", 
    status: "Successful" 
  },
  { 
    organization: "DataFlow Solutions", 
    plan: "Business", 
    amount: "599", 
    date: "May 26, 2023", 
    status: "Failed" 
  },
  { 
    organization: "Quantum Innovations", 
    plan: "Enterprise", 
    amount: "1,200", 
    date: "May 25, 2023", 
    status: "Successful" 
  },
  { 
    organization: "CyberTech Systems", 
    plan: "Standard", 
    amount: "299", 
    date: "May 24, 2023", 
    status: "Pending" 
  },
];