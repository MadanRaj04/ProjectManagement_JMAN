export interface Task {
  task_id?: string;
  project_id?: string;
  asignee?: string;
  title?: string;
  content: string;
}

export interface CardType {
  id: string;
  ticketId: string;
  title: string;
  content: string;
  column: ColumnType;
  priority: PriorityLevel;
  assignee?: string; 
}

export type ColumnType = "backlog" | "todo" | "doing" | "done";
export type PriorityLevel = 1 | 2 | 3;