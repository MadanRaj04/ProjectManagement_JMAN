"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Users, UserPlus, ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { TaskStatus } from "@prisma/client";

export default function ManagerProjectView() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Forms
  const [inviteEmail, setInviteEmail] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      } else {
        router.push("/manager/dashboard");
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

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/manager/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: params.id, email: inviteEmail }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setInviteEmail("");
        setIsInviteModalOpen(false);
        alert("Invitation sent to " + inviteEmail);
      } else {
        alert(data.error);
      }
    } catch (error) {
       console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: taskTitle, 
          projectId: params.id,
          assignedToId: assignedToId || undefined
        }),
      });

      if (res.ok) {
        setTaskTitle("");
        setAssignedToId("");
        setIsTaskModalOpen(false);
        fetchProjectDetails();
      }
    } catch (error) {
      console.error(error);
    } finally {
       setIsSubmitting(false);
    }
  };

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

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProjectDetails();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete task");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6 flex flex-col gap-4">
        <Link 
          href="/manager/dashboard" 
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
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass" onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
            <Button className="bg-gradient-to-r from-brand-600 to-indigo-600 shadow-md shadow-brand-500/20" onClick={() => setIsTaskModalOpen(true)}>
              Add Task
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          tasks={project.tasks} 
          onTaskMove={handleTaskMove}
          onTaskDelete={handleTaskDelete}
          members={project.members}
          isManager={true}
        />
      </div>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
         <form onSubmit={handleInviteUser} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              User Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              The user must already be registered in the system to receive the invite.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Send Invite</Button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
         <form onSubmit={handleCreateTask} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="title">
                Task Title
              </label>
              <Input
                id="title"
                placeholder="Design the main landing page"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="assignee">
                Assign To (Optional)
              </label>
              <select
                id="assignee"
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {project.members.map((m: any) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.username} ({m.user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
