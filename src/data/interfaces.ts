export interface CardType {
  id: string;
  ticketId: string;
  title: string;
  content?: string;
  column: ColumnType;
  priority: number;
  assignee?: string; 
}

export interface Member {
  initials: string;
  name: string;
  role: string;
  color: string;
};

export type ColumnType = "backlog" | "todo" | "doing" | "done";