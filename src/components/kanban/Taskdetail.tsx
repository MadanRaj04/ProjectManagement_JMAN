"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlignLeft, CheckSquare, MessageSquare, Loader2, User2 } from "lucide-react";
import { TaskStatus } from "@prisma/client";

const PRIORITY_MAP: Record<number, { label: string; css: string }> = {
  1: { label: "High",   css: "bg-red-100 text-red-600 border-red-200" },
  2: { label: "Medium", css: "bg-yellow-100 text-yellow-600 border-yellow-200" },
  3: { label: "Low",    css: "bg-blue-100 text-blue-500 border-blue-200" },
};

const STATUS_OPTIONS: { value: TaskStatus; label: string; css: string }[] = [
  { value: TaskStatus.TODO,        label: "TODO",        css: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress", css: "bg-blue-50 text-blue-700 border-blue-200"      },
  { value: TaskStatus.DONE,        label: "Complete",    css: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

interface UserStub {
  id: string;
  username: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: UserStub;
}

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  status: TaskStatus;
  assignedTo: UserStub | null;
  comments: Comment[];
}

interface Member {
  user: UserStub;
}

interface TaskDetailPanelProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onTaskUpdated?: (updated: Partial<TaskDetail> & { id: string }) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function TaskDetailPanel({
  taskId,
  isOpen,
  onClose,
  members,
  onTaskUpdated,
}: TaskDetailPanelProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<string | null>(null); 
  const [title, setTitle] = useState<string>("");
  const [description, setDesc] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<number>(2);
  const [assigneeId, setAssignee] = useState<string>("");
  const [commentText, setComment] = useState<string>("");
  const [postingComment, setPosting] = useState<boolean>(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!taskId || !isOpen) return;
    setLoading(true);
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((data: TaskDetail) => {
        setTask(data);
        setTitle(data.title);
        setDesc(data.description ?? "");
        setStatus(data.status);
        setPriority(data.priority);
        setAssignee(data.assignedTo?.id ?? "");
      })
      .finally(() => setLoading(false));
  }, [taskId, isOpen]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [task?.comments]);

  async function patch(field: string, body: Record<string, unknown>) {
    if (!task) return;
    setSaving(field);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setTask((prev) => prev ? { ...prev, ...updated } : prev);
      onTaskUpdated?.({ id: task.id, ...updated });
    } finally {
      setSaving(null);
    }
  }

  const saveTitle = () => {
    if (title.trim() && title !== task?.title) patch("title", { title: title.trim() });
  };

  const saveDesc = () => {
    if (description !== (task?.description ?? "")) patch("description", { description });
  };

  const handleStatusChange = (s: TaskStatus) => {
    setStatus(s);
    patch("status", { status: s });
  };

  const handlePriorityChange = (p: number) => {
    setPriority(p);
    patch("priority", { priority: p });
  };

  const handleAssigneeChange = (id: string) => {
    setAssignee(id);
    patch("assignedTo", { assignedToId: id || null });
  };

  const postComment = async () => {
    if (!commentText.trim() || !task) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const newComment: Comment = await res.json();
      setTask((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : prev
      );
      setComment("");
      onTaskUpdated?.({ id: task.id, _count: { comments: (task.comments.length + 1) } } as any);
    } finally {
      setPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 z-60 flex h-screen w-full max-w-2xl flex-col bg-white border-l border-gray-200 shadow-2xl overflow-hidden"
          >
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            ) : task ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 px-8 py-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Projects</span>
                    <span>/</span>
                    <span>Tasks</span>
                    <span>/</span>
                    <span className="font-mono text-gray-500">{task.id.slice(0, 8)}…</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-8 py-7">
                    <div>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300"
                        placeholder="Task title"
                      />
                      {saving === "title" && (
                        <span className="text-xs text-gray-400">Saving…</span>
                      )}
                    </div>

                    <section>
                      <div className="flex items-center gap-2 mb-2 text-gray-600 font-semibold text-sm">
                        <AlignLeft className="h-4 w-4" />
                        <span>Description</span>
                        {saving === "description" && (
                          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                        )}
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDesc(e.target.value)}
                        onBlur={saveDesc}
                        placeholder="Add a more detailed description..."
                        rows={4}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none transition-colors"
                      />
                    </section>

                    <section className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-4 text-gray-600 font-semibold text-sm">
                        <MessageSquare className="h-4 w-4" />
                        <span>Activity</span>
                        <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {task.comments.length}
                        </span>
                      </div>

                      <div className="flex flex-col gap-4 mb-4 max-h-64 overflow-y-auto pr-1">
                        {task.comments.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No comments yet. Be the first!</p>
                        ) : (
                          task.comments.map((c) => (
                            <div key={c.id} className="flex gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 border border-violet-200">
                                {c.user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xs font-semibold text-gray-700">
                                    {c.user.username}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {formatTime(c.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-600 leading-snug">
                                  {c.content}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={commentsEndRef} />
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <textarea
                          value={commentText}
                          onChange={(e) => setComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              postComment();
                            }
                          }}
                          placeholder="Add a comment… (Enter to send)"
                          rows={2}
                          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none transition-colors"
                        />
                        <button
                          onClick={postComment}
                          disabled={postingComment || !commentText.trim()}
                          className="self-end rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-40 transition-colors"
                        >
                          {postingComment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Send"
                          )}
                        </button>
                      </div>
                    </section>
                  </div>

                  <div className="w-56 shrink-0 border-l border-gray-100 overflow-y-auto px-5 py-7 space-y-6 bg-gray-50/60">

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Status
                      </label>
                      <div className="flex flex-col gap-1">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(opt.value)}
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold text-left transition-all ${
                              status === opt.value
                                ? opt.css + " shadow-sm"
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {opt.label}
                            {saving === "status" && status === opt.value && (
                              <Loader2 className="inline h-3 w-3 animate-spin ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Priority
                      </label>
                      <div className="flex flex-col gap-1">
                        {Object.entries(PRIORITY_MAP).map(([p, info]) => (
                          <button
                            key={p}
                            onClick={() => handlePriorityChange(Number(p))}
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold text-left transition-all ${
                              priority === Number(p)
                                ? info.css + " shadow-sm"
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {info.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Assignee
                      </label>
                      <select
                        value={assigneeId}
                        onChange={(e) => handleAssigneeChange(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
                      >
                        <option value="">Unassigned</option>
                        {members.map((m) => (
                          <option key={m.user.id} value={m.user.id}>
                            {m.user.username}
                          </option>
                        ))}
                      </select>

                      <div className="mt-2 flex items-center gap-2">
                        {task.assignedTo ? (
                          <>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 border border-violet-200">
                              {task.assignedTo.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600">{task.assignedTo.username}</span>
                          </>
                        ) : (
                          <>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                              <User2 className="h-3 w-3 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-400">Unassigned</span>
                          </>
                        )}
                        {saving === "assignedTo" && (
                          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Created at */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Created
                      </label>
                      <p className="text-xs text-gray-500">
                        {formatTime((task as any).createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}