"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Users, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TaskStatus } from "@prisma/client";

const PRIORITY_OPTIONS = [
  { value: 1, label: "High",   css: "bg-red-100 text-red-600 border-red-200"         },
  { value: 2, label: "Medium", css: "bg-yellow-100 text-yellow-600 border-yellow-200" },
  { value: 3, label: "Low",    css: "bg-blue-100 text-blue-500 border-blue-200"       },
];

export default function ManagerProjectView() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject]     = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen]     = useState(false);

  const [inviteEmail, setInviteEmail]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Create task form state ──────────────────────────────────────────
  const [taskTitle, setTaskTitle]         = useState("");
  const [taskDescription, setTaskDesc]   = useState("");
  const [taskPriority, setTaskPriority]   = useState(2);
  const [taskStatus, setTaskStatus]       = useState<TaskStatus>(TaskStatus.TODO);
  const [assignedToId, setAssignedToId]   = useState("");

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

  // ── Invite ──────────────────────────────────────────────────────────
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

  // ── Create task ─────────────────────────────────────────────────────
  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDesc("");
    setTaskPriority(2);
    setTaskStatus(TaskStatus.TODO);
    setAssignedToId("");
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
          title:        taskTitle,
          description:  taskDescription || undefined,
          priority:     taskPriority,
          status:       taskStatus,
          projectId:    params.id,
          assignedToId: assignedToId || undefined,
        }),
      });
      if (res.ok) {
        resetTaskForm();
        setIsTaskModalOpen(false);
        fetchProjectDetails();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Task move / delete ──────────────────────────────────────────────
  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: newStatus }),
    });
    if (!res.ok) throw new Error("Failed to update task");
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjectDetails();
      } else {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        alert(data.error || "Failed to delete task");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────
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
      {/* ── Page header ── */}
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
            <Button
              className="bg-gradient-to-r from-brand-600 to-indigo-600 shadow-md shadow-brand-500/20"
              onClick={() => setIsTaskModalOpen(true)}
            >
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* ── Kanban ── */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          tasks={project.tasks}
          onTaskMove={handleTaskMove}
          onTaskDelete={handleTaskDelete}
          members={project.members}
          isManager={true}
        />
      </div>

      {/* ── Invite modal ── */}
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

      {/* ── Create task modal ── */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); resetTaskForm(); }}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-5">

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="title">
              Task Title <span className="text-red-400">*</span>
            </label>
            <Input
              id="title"
              placeholder="e.g. Design the main landing page"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="description">
              Description <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Add more context about this task..."
              value={taskDescription}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none transition-colors"
            />
          </div>

          {/* Priority + Status side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <div className="flex flex-col gap-1">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setTaskPriority(opt.value)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold text-left transition-all ${
                      taskPriority === opt.value
                        ? opt.css + " shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="flex flex-col gap-1">
                {[
                  { value: TaskStatus.TODO,        label: "TODO",        css: "bg-yellow-50 text-yellow-700 border-yellow-200"   },
                  { value: TaskStatus.IN_PROGRESS,  label: "In Progress", css: "bg-blue-50 text-blue-700 border-blue-200"         },
                  { value: TaskStatus.DONE,         label: "Complete",    css: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setTaskStatus(opt.value)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold text-left transition-all ${
                      taskStatus === opt.value
                        ? opt.css + " shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="assignee">
              Assign To <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              id="assignee"
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
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

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setIsTaskModalOpen(false); resetTaskForm(); }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}