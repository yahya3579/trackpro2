"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, ClipboardList } from "lucide-react";

export default function ViewLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      const token = getToken();
      if (!token) return;
      let employeeId = null;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          employeeId = parsedUser.employee_id || parsedUser.id;
        }
      } catch (e) {
        setLoading(false);
        return;
      }
      if (!employeeId) {
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/leave-management?employee_id=${employeeId}`, {
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaveRequests || []);
      }
      setLoading(false);
    };
    fetchLeaves();
  }, []);

  const statusIcon = (status) => {
    if (status === "approved") return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === "rejected") return <XCircle className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">View Leaves</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500 mr-2" />
              Loading leave requests...
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center text-gray-500">No leave requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Badge style={{ background: leave.leave_type_color || '#e5e7eb', color: '#222' }}>
                          {leave.leave_type_name}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {leave.start_date} - {leave.end_date}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">{leave.total_days}</td>
                      <td className="px-4 py-2 whitespace-nowrap max-w-xs truncate" title={leave.reason}>{leave.reason || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                        {statusIcon(leave.status)}
                        <span className={
                          leave.status === 'approved' ? 'text-green-600 font-semibold' :
                          leave.status === 'rejected' ? 'text-red-600 font-semibold' :
                          'text-yellow-600 font-semibold'
                        }>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                        {leave.status === 'rejected' && leave.rejection_reason && (
                          <span className="ml-2 text-xs text-gray-400">({leave.rejection_reason})</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{leave.updated_at ? leave.updated_at.split('T')[0] : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 