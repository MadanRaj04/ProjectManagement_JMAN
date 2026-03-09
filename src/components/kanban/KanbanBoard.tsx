"use client";

import * as React from "react";
import { TaskStatus } from "@prisma/client";
import { TaskCard } from "./TaskCard";
import { TaskDetailPanel } from "./Taskdetail";

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

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  members: { user: User }[];
  isManager: boolean;
  onTaskClick?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
}

const COLUMNS: { id: TaskStatus; title: string; headingColor: string }[] = [
  { id: TaskStatus.TODO,        title: "TODO",        headingColor: "text-yellow-600" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress", headingColor: "text-blue-600"   },
  { id: TaskStatus.DONE,        title: "Complete",    headingColor: "text-emerald-600" },
];

/* ─── DropIndicator ──────────────────────────────────────────────────── */
const DropIndicator = ({
  beforeId,
  column,
}: {
  beforeId: string | null;
  column: string;
}) => (
  <div
    data-before={beforeId ?? "-1"}
    data-column={column}
    className="my-0.5 h-0.5 w-full rounded bg-violet-400 opacity-0 transition-opacity"
  />
);

/* ─── Column ─────────────────────────────────────────────────────────── */
interface ColumnProps {
  column: TaskStatus;
  title: string;
  headingColor: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  isManager: boolean;
  onCardClick: (task: Task) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
}

const Column = ({
  column,
  title,
  headingColor,
  tasks,
  setTasks,
  onTaskMove,
  isManager,
  onCardClick,
  onTaskDelete,
}: ColumnProps) => {
  const [active, setActive] = React.useState(false);
  const columnTasks = tasks.filter((t) => t.status === column);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const getIndicators = () =>
    Array.from(document.querySelectorAll<HTMLElement>(`[data-column="${column}"]`));

  const clearHighlights = (els?: HTMLElement[]) => {
    (els ?? getIndicators()).forEach((el) => (el.style.opacity = "0"));
  };

  const getNearestIndicator = (e: React.DragEvent, indicators: HTMLElement[]) => {
    const OFFSET = 50;
    return indicators.reduce<{ offset: number; element: HTMLElement }>(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + OFFSET);
        return offset < 0 && offset > closest.offset
          ? { offset, element: child }
          : closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    );
  };

  const highlightIndicator = (e: React.DragEvent) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const { element } = getNearestIndicator(e, indicators);
    element.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");
    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before ?? "-1";
    if (before === taskId) return;

    setTasks((prev) => {
      let copy = [...prev];
      const taskToMove = copy.find((t) => t.id === taskId);
      if (!taskToMove) return prev;
      const updated = { ...taskToMove, status: column };
      copy = copy.filter((t) => t.id !== taskId);
      if (before === "-1") {
        copy.push(updated);
      } else {
        const idx = copy.findIndex((t) => t.id === before);
        copy.splice(idx, 0, updated);
      }
      return copy;
    });

    try {
      await onTaskMove(taskId, column);
    } catch {
      // parent will re-sync via tasks prop
    }
  };

  return (
    <div className="w-64 shrink-0">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className={`font-semibold text-sm ${headingColor}`}>{title}</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
          {columnTasks.length}
        </span>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`min-h-[160px] rounded-xl border p-2 transition-colors ${
          active ? "bg-violet-50 border-violet-300" : "bg-gray-50 border-gray-200"
        }`}
      >
        {columnTasks.map((task) => (
          <React.Fragment key={task.id}>
            <DropIndicator beforeId={task.id} column={column} />
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onClick={() => onCardClick(task)}
              className="mb-2 cursor-grab active:cursor-grabbing"
            >
              <TaskCard
                task={task}
                isManager={isManager}
                onDelete={onTaskDelete ? () => onTaskDelete(task.id) : undefined}
              />
            </div>
          </React.Fragment>
        ))}
        <DropIndicator beforeId={null} column={column} />
      </div>
    </div>
  );
};

/* ─── Board ──────────────────────────────────────────────────────────── */
export function KanbanBoard({
  tasks,
  onTaskMove,
  members,
  isManager,
  onTaskDelete,
}: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = React.useState<Task[]>(tasks);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  const isSearching = searchQuery.length > 0;

  const filteredTasks = boardTasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Merge updates from TaskDetail back into board state
  const handleTaskUpdated = (updated: Partial<Task> & { id: string }) => {
    setBoardTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
    );
  };

  return (
    <div className="flex w-full flex-col">
      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-72 rounded border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Columns */}
      <div className="flex w-full gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            column={col.id}
            title={col.title}
            headingColor={col.headingColor}
            tasks={filteredTasks}
            setTasks={setBoardTasks}
            onTaskMove={onTaskMove}
            isManager={isManager}
            onCardClick={(task) => setSelectedTaskId(task.id)}
            onTaskDelete={onTaskDelete}
          />
        ))}
      </div>

      {/* Task detail panel */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        members={members}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}