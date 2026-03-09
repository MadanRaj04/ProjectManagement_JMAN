import { MessageSquare, Trash2 } from "lucide-react";
import { TaskStatus } from "@prisma/client";

/* ─── Priority helpers ───────────────────────────────────────────────── */
const PRIORITY_MAP: Record<number, { label: string; css: string }> = {
  1: { label: "High", css: "bg-red-100 text-red-600 border-red-200" },
  2: { label: "Med",  css: "bg-yellow-100 text-yellow-600 border-yellow-200" },
  3: { label: "Low",  css: "bg-blue-100 text-blue-500 border-blue-200" },
};

const PriorityTag = ({ priority }: { priority?: number }) => {
  const { label, css } = PRIORITY_MAP[priority ?? 2];
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${css}`}>
      {label}
    </span>
  );
};


interface User {
  id: string;
  username: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: number;
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
    <div className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
      {/* Delete — manager only */}
      {isManager && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute right-2 top-2 rounded p-1 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-500 transition-all group-hover:opacity-100"
          title="Delete Task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Priority */}
      <div className="mb-2">
        <PriorityTag priority={task.priority} />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 pr-6 leading-snug">
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="mt-1 text-xs text-gray-400 line-clamp-2 pr-6">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2 flex items-center justify-between border-t border-gray-100">
        {task.assignedTo ? (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700 border border-violet-200"
            title={`Assigned to ${task.assignedTo.username}`}
          >
            {task.assignedTo.username.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-[10px] text-gray-400"
            title="Unassigned"
          >
            ?
          </div>
        )}

        {task._count.comments > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{task._count.comments}</span>
          </div>
        )}
      </div>
    </div>
  );
}