"use client";

import * as React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Search } from "lucide-react";
import { TaskStatus } from "@prisma/client";
import { TaskCard } from "./TaskCard";
import { Input } from "@/components/ui/Input";

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

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  members: { user: User }[];
  isManager: boolean;
  onTaskClick?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
}

const COLUMNS = [
  { id: TaskStatus.TODO, title: "To Do" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress" },
  { id: TaskStatus.DONE, title: "Done" },
];

export function KanbanBoard({ tasks, onTaskMove, members, isManager, onTaskClick, onTaskDelete }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = React.useState<Task[]>(tasks);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    
    const updatedTasks = boardTasks.map(task => 
        task.id === draggableId ? { ...task, status: newStatus } : task
    );
    setBoardTasks(updatedTasks);

    try {
      await onTaskMove(draggableId, newStatus);
    } catch (error) {
      console.error("Failed to move task", error);
      setBoardTasks(tasks);
    }
  };

  const filteredTasks = boardTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative max-w-sm ml-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Filter tasks by title..." 
          className="pl-9 bg-surface/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 w-full gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter(task => task.status === column.id);

          return (
            <div key={column.id} className="flex min-w-[320px] max-w-[320px] flex-col rounded-xl bg-surface/40 p-4 border border-border shadow-sm">
              <div className="mb-4 flex items-center justify-between px-1">
                <h3 className="font-semibold">{column.title}</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {columnTasks.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[150px] transition-colors duration-200 rounded-lg p-1 ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 ${snapshot.isDragging ? 'opacity-90 scale-[1.02]' : ''}`}
                            onClick={() => onTaskClick?.(task)}
                          >
                            <TaskCard task={task} isManager={isManager} onDelete={onTaskDelete ? () => onTaskDelete(task.id) : undefined} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
        </div>
      </DragDropContext>
    </div>
  );
}
