"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function MyWorkPage() {
  const [selectedTab, setSelectedTab] = useState("active");

  const tasks = [
    {
      id: 1,
      title: "Complete project documentation",
      status: "active",
      priority: "high",
      dueDate: "2023-06-15",
      progress: 75
    },
    {
      id: 2,
      title: "Review code changes",
      status: "active",
      priority: "medium",
      dueDate: "2023-06-18",
      progress: 30
    },
    {
      id: 3,
      title: "Implement new feature",
      status: "active",
      priority: "high",
      dueDate: "2023-06-20",
      progress: 10
    },
    {
      id: 4,
      title: "Fix UI bugs",
      status: "completed",
      priority: "medium",
      dueDate: "2023-06-10",
      progress: 100
    },
    {
      id: 5,
      title: "Update dependencies",
      status: "completed",
      priority: "low",
      dueDate: "2023-06-05",
      progress: 100
    }
  ];

  const activeTasks = tasks.filter(task => task.status === "active");
  const completedTasks = tasks.filter(task => task.status === "completed");

  function getPriorityBadge(priority) {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Work</h1>
        <Button>
          New Task
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active" className="flex gap-2">
            <AlertCircle className="h-4 w-4" />
            Active Tasks
            <Badge variant="secondary">{activeTasks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
            <Badge variant="secondary">{completedTasks.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({ task }) {
  function getPriorityBadge(priority) {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
        {getPriorityBadge(task.priority)}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
          
          {task.status === "active" && (
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm">View Details</Button>
              <Button size="sm">Mark Complete</Button>
            </div>
          )}
          
          {task.status === "completed" && (
            <div className="mt-4 flex items-center text-green-600">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 