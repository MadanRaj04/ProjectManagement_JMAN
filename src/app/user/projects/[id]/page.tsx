"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Badge } from "@/components/ui/Badge";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TaskStatus } from "@prisma/client";

export default function UserProjectView() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      } else {
        router.push("/user/dashboard");
      }
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [params.id, router]);

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: newStatus }),
    });
    
    if (!res.ok) {
        throw new Error("Failed to update task");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6 flex flex-col gap-4">
        <Link 
          href="/user/dashboard" 
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant="success" className="h-6">Active</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Users className="h-4 w-4" />
               <span>{project.members.length} team members</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          tasks={project.tasks} 
          onTaskMove={handleTaskMove}
          members={project.members}
          isManager={false}
        />
      </div>
    </div>
  );
}
