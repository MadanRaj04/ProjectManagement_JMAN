"use client";

import * as React from "react";
import { MessageSquare, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TaskStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  username: string;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: User | null;
  _count: { comments: number };
}

interface TaskCardProps {
  task: Task;
  isManager?: boolean;
  onDelete?: () => void;
}

export function TaskCard({ task, isManager, onDelete }: TaskCardProps) {
  return (
    <div className="glass-card group flex cursor-grab flex-col gap-3 p-4 active:cursor-grabbing relative">
      {isManager && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive transition-all group-hover:opacity-100"
          title="Delete Task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start justify-between gap-2 pr-6">
        <h4 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
          {task.title}
        </h4>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between border-t border-border/50">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <div 
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 text-xs font-semibold text-brand-900 shadow-sm border border-brand-200"
              title={`Assigned to ${task.assignedTo.username}`}
            >
              {task.assignedTo.username.charAt(0).toUpperCase()}
            </div>
          ) : (
             <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted border border-border text-xs text-muted-foreground shadow-sm decoration-dashed" title="Unassigned">
              ?
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          {task._count.comments > 0 && (
            <div className="flex items-center text-xs font-medium gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{task._count.comments}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
