"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Users, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskStatus } from "@prisma/client";

export default function ManagerProjectView() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAllocModalOpen, setIsAllocModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [allocUserId, setAllocUserId] = useState<string>("");
  const [allocStart, setAllocStart] = useState<string>("");
  const [allocEnd, setAllocEnd] = useState<string>("");
  const [allocPercent, setAllocPercent] = useState<number>(0);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskPriority, setTaskPriority] = useState<number>(2);
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        credentials: "include"
      });
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

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchUsers();
  }, [params.id]);

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocUserId || !allocStart || !allocEnd || allocPercent <= 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          userId: allocUserId,
          projectId: params.id,
          startDate: allocStart,
          endDate: allocEnd,
          allocationPercentage: allocPercent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAllocModalOpen(false);
        setAllocUserId('');
        setAllocStart('');
        setAllocEnd('');
        setAllocPercent(0);
        fetchProjectDetails();
      } else {
        alert(data.error || 'Allocation failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || null,
          priority: taskPriority,
          projectId: params.id,
          status: TaskStatus.TODO,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsTaskModalOpen(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority(2);
        fetchProjectDetails();
      } else {
        alert(data.error || 'Task creation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
        credentials: "include",
      });
      if (res.ok) {
        fetchProjectDetails();
      } else {
        alert("Failed to delete task");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-r-transparent" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* header */}
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
              {project.projectCode && <span>Code: {project.projectCode}</span>}
              {project.projectDate && <span>Date: {new Date(project.projectDate).toLocaleDateString()}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{project.members.length} team members</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsTaskModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
            <Button onClick={() => setIsAllocModalOpen(true)}>
              Allocate Resource
            </Button>
          </div>
        </div>
      </div>

      {/* tasks board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          tasks={project.tasks || []} 
          onTaskMove={handleTaskMove}
          members={project.members}
          isManager={true}
          onTaskDelete={handleTaskDelete}
        />
      </div>

      {/* task creation modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">Task Title *</label>
            <Input 
              id="title"
              type="text"
              placeholder="Enter task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter task description (optional)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm min-h-[100px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(Number(e.target.value))}
              className="w-full rounded-md border px-2 py-1"
            >
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* allocation modal */}
      <Modal isOpen={isAllocModalOpen} onClose={() => setIsAllocModalOpen(false)} title="Allocate Resource">
        <form onSubmit={handleCreateAllocation} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="user">User</label>
            <select
              id="user"
              value={allocUserId}
              onChange={(e) => setAllocUserId(e.target.value)}
              className="w-full rounded-md border px-2 py-1"
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="start">Start Date</label>
            <Input id="start" type="date" value={allocStart} onChange={(e) => setAllocStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="end">End Date</label>
            <Input id="end" type="date" value={allocEnd} onChange={(e) => setAllocEnd(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="percent">Allocation (%)</label>
            <Input
              id="percent"
              type="number"
              min={0}
              max={100}
              value={allocPercent}
              onChange={(e) => setAllocPercent(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAllocModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}