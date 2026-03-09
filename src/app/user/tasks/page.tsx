"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TaskStatus } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
}

export default function UserTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const result = await res.json();
          setTasks(result.user.assignedTasks || []);
        } else {
          router.push('/login');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4border-r-transparent"></div>
      </div>
    );
  }

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <Badge variant="warning">To Do</Badge>;
      case TaskStatus.IN_PROGRESS:
        return <Badge variant="info">In Progress</Badge>;
      case TaskStatus.DONE:
        return <Badge variant="success">Done</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-1">View all your assigned tasks across all projects.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.length === 0 ? (
          <div className="col-span-full p-8 text-center border border-dashed rounded-xl bg-surface/30 text-muted-foreground">
            You don't have any tasks assigned to you right now. 
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="glass">
              <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                {getStatusBadge(task.status)}
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {task.description || "No description provided."}
                </p>
                <div className="text-xs border-t border-border mt-2 pt-3 text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    Task ID: {task.id.slice(0, 8)}...
                  </span>
                  <span>Project ID: {task.projectId.slice(0, 8)}...</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
