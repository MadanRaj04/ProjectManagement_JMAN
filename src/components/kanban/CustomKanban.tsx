// "use client";

// import React, { useState } from "react";
// import { 
//   FiPlus, 
//   FiTrash, 
//   FiSearch, 
//   FiMoreHorizontal, 
//   FiArrowUp, 
//   FiArrowDown, 
//   FiMinus, 
//   FiSidebar,
//   FiFilter
// } from "react-icons/fi";
// import { FaJira } from "react-icons/fa";
// import { motion, AnimatePresence } from "framer-motion";
// import TaskDetail from "../taskDetail/Task"; 

// // --- Types ---
// type ColumnType = "backlog" | "todo" | "doing" | "done";
// type PriorityLevel = 1 | 2 | 3;

// export interface CardType {
//   id: string;
//   ticketId: string;
//   title: string;
//   column: ColumnType;
//   priority: PriorityLevel;
//   assignee?: string; 
// }

// // --- Constants ---
// const DEFAULT_CARDS: CardType[] = [
//   { title: "Look into render bug", id: "1", ticketId: "WEB-101", column: "backlog", priority: 1, assignee: "JD" },
//   { title: "SOX compliance checklist", id: "2", ticketId: "WEB-102", column: "backlog", priority: 2, assignee: "AL" },
//   { title: "[SPIKE] Migrate to Azure", id: "3", ticketId: "WEB-103", column: "backlog", priority: 3 },
//   { title: "Document Notifications service", id: "4", ticketId: "WEB-104", column: "backlog", priority: 3, assignee: "PR" },
//   { title: "Research DB options", id: "5", ticketId: "WEB-105", column: "todo", priority: 1 },
//   { title: "Postmortem for outage", id: "6", ticketId: "WEB-106", column: "todo", priority: 2, assignee: "JD" },
//   { title: "Sync with product", id: "7", ticketId: "WEB-107", column: "todo", priority: 1 },
//   { title: "Refactor providers", id: "8", ticketId: "WEB-108", column: "doing", priority: 3, assignee: "AL" },
//   { title: "Add logging to CRON", id: "9", ticketId: "WEB-109", column: "doing", priority: 1 },
//   { title: "Set up dashboards", id: "10", ticketId: "WEB-110", column: "done", priority: 2, assignee: "PR" },
// ];

// const COLUMN_COLORS = {
//   backlog: "border-t-4 border-t-slate-400",
//   todo: "border-t-4 border-t-blue-500",
//   doing: "border-t-4 border-t-amber-500",
//   done: "border-t-4 border-t-emerald-500",
// };

// // --- Main Component ---
// export const CustomKanban: React.FC = () => {
//   return (
//     <div className="flex h-screen w-full bg-white text-slate-900 font-sans">
//       <Sidebar />
//       <div className="flex-1 flex flex-col h-full overflow-hidden">
//         <TopBar />
//         <Board />
        
//       </div>
//     </div>
//   );
// };

// // --- Sub-Components ---

// const Sidebar = () => {
//   return (
//     <div className="w-16 lg:w-64 bg-[#091E42] text-white flex flex-col shrink-0 transition-all duration-300 border-r border-slate-200">
//       <div className="h-14 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
//         <FaJira className="text-2xl" />
//         <span className="ml-3 font-bold text-lg hidden lg:block">Jira Clone</span>
//       </div>
      
//       <div className="p-4 space-y-4">
//         <div className="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
//           Planning
//         </div>
//         <SidebarItem icon={<FiSidebar />} label="Board" active />
//         <SidebarItem icon={<FiPlus />} label="Create Issue" />
//         <SidebarItem icon={<FiSearch />} label="Search" />
//       </div>
//     </div>
//   );
// };

// const SidebarItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
//   <div className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${active ? 'bg-white/10 text-blue-300' : 'hover:bg-white/5 text-slate-300'}`}>
//     <span className="text-xl">{icon}</span>
//     <span className="hidden lg:block text-sm font-medium">{label}</span>
//   </div>
// );

// const TopBar = () => {
//   return (
//     <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
//       <div className="flex items-center gap-4">
//         <h1 className="text-lg font-semibold text-slate-800">Web Development Sprint 24</h1>
//         <span className="text-slate-400 text-sm">|</span>
//         <div className="flex -space-x-2">
//            <Avatar initials="JD" color="bg-blue-500" />
//            <Avatar initials="AL" color="bg-purple-500" />
//            <Avatar initials="PR" color="bg-emerald-500" />
//            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-bold">+2</div>
//         </div>
//       </div>
//       <div className="flex items-center gap-3">
//         <button className="text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2">
//           <FiFilter /> Filter
//         </button>
//         <button className="bg-[#0052CC] hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
//           Complete Sprint
//         </button>
//       </div>
//     </div>
//   );
// };

// const Board: React.FC = () => {
//   const [cards, setCards] = useState<CardType[]>(DEFAULT_CARDS);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [selectedTask, setSelectedTask] = useState<CardType | null>(null);

//   const filteredCards = cards.filter((c) =>
//     c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
//     c.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
//       {/* Board Header / Search */}
//       <div className="p-4 px-6 flex items-center gap-4">
//         <div className="relative group w-64">
//            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
//            <input 
//              type="text" 
//              placeholder="Search board..." 
//              className="w-full bg-transparent border-2 border-slate-200 rounded px-10 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
//              value={searchTerm}
//              onChange={(e) => setSearchTerm(e.target.value)}
//            />
//         </div>
//       </div>

//       {/* Columns Container */}
//       <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4">
//         <div className="flex h-full gap-4 min-w-max">
//           {(["backlog", "todo", "doing", "done"] as ColumnType[]).map((col) => (
//             <Column
//               key={col}
//               title={col}
//               column={col}
//               cards={filteredCards}
//               setCards={setCards}
//               onCardClick={setSelectedTask}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Floating Trash Bin */}
//       <TrashBin setCards={setCards} />

//       <TaskDetail
//         task={selectedTask}
//         isOpen={!!selectedTask}
//         onClose={() => setSelectedTask(null)}
//       />
//     </div>
//   );
// };

// const Column: React.FC<{
//   title: string;
//   column: ColumnType;
//   cards: CardType[];
//   setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
//   onCardClick: (card: CardType) => void;
// }> = ({ title, column, cards, setCards, onCardClick }) => {
//   const [active, setActive] = useState(false);
//   const filteredCards = cards.filter((c) => c.column === column);

//   const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardType) => {
//     e.dataTransfer.setData("cardId", card.id);
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     const cardId = e.dataTransfer.getData("cardId");
//     setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, column } : c)));
//     setActive(false);
//   };

//   // Maps for prettier display names
//   const titleMap: Record<string, string> = {
//     backlog: "Backlog",
//     todo: "Development",
//     doing: "In Progress",
//     done: "Completed",
//   };

//   return (
//     <div className="w-[280px] flex flex-col shrink-0 h-full">
//       {/* Column Header */}
//       <div className="flex items-center justify-between mb-3 px-1">
//         <h3 className={`font-semibold text-xs text-slate-500 uppercase tracking-wide`}>
//           {titleMap[column]} <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{filteredCards.length}</span>
//         </h3>
//         <div className="flex gap-1">
//            <button className="text-slate-400 hover:text-slate-600"><FiMoreHorizontal /></button>
//         </div>
//       </div>

//       {/* Droppable Area */}
//       <div
//         onDragOver={(e) => {
//           e.preventDefault();
//           setActive(true);
//         }}
//         onDragLeave={() => setActive(false)}
//         onDrop={handleDrop}
//         className={`flex-1 bg-[#F4F5F7] rounded-lg p-2 flex flex-col gap-2 overflow-y-auto transition-colors duration-200 ${
//           active ? "bg-blue-50 ring-2 ring-blue-300 ring-inset" : ""
//         }`}
//       >
//         <AnimatePresence>
//           {filteredCards.map((card) => (
//             <Card
//               key={card.id}
//               {...card}
//               onCardClick={onCardClick}
//               handleDragStart={handleDragStart}
//             />
//           ))}
//         </AnimatePresence>
        
//         <AddCard column={column} setCards={setCards} />
//       </div>
//     </div>
//   );
// };

// const Card: React.FC<CardType & { 
//   onCardClick: (card: CardType) => void; 
//   handleDragStart: Function 
// }> = ({ id, ticketId, title, column, priority, assignee, onCardClick, handleDragStart }) => {
//   return (
//     <motion.div
//       layout
//       layoutId={id}
//       draggable
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.9 }}
//       whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
//       onClick={() => onCardClick({ id, ticketId, title, column, priority, assignee })}
//       onDragStart={(e) => handleDragStart(e, { id })}
//       className="cursor-grab active:cursor-grabbing bg-white p-3 rounded shadow-sm border border-slate-200 hover:border-blue-400 group"
//     >
//       <div className="flex justify-between items-start mb-2">
//         <p className="text-sm text-slate-800 leading-snug font-medium">{title}</p>
//       </div>
      
//       <div className="flex items-center justify-between mt-3">
//         <div className="flex items-center gap-2">
//           <PriorityIcon priority={priority} />
//           <span className="text-[10px] font-bold text-slate-400 uppercase">{ticketId}</span>
//         </div>
        
//         {assignee && (
//            <Avatar initials={assignee} size="w-6 h-6 text-[10px]" />
//         )}
//       </div>
//     </motion.div>
//   );
// };

// const PriorityIcon = ({ priority }: { priority: PriorityLevel }) => {
//   if (priority === 1) return <div className="bg-red-100 p-0.5 rounded"><FiArrowUp className="text-red-600 text-xs" /></div>;
//   if (priority === 2) return <div className="bg-amber-100 p-0.5 rounded"><FiMinus className="text-amber-600 text-xs" /></div>;
//   return <div className="bg-blue-100 p-0.5 rounded"><FiArrowDown className="text-blue-600 text-xs" /></div>;
// };

// const Avatar = ({ initials, color = "bg-blue-500", size = "w-8 h-8 text-xs" }: { initials: string, color?: string, size?: string }) => (
//     <div className={`${size} rounded-full ${color} text-white flex items-center justify-center font-bold ring-2 ring-white`}>
//         {initials}
//     </div>
// )

// const AddCard: React.FC<{ column: ColumnType; setCards: React.Dispatch<React.SetStateAction<CardType[]>> }> = ({ column, setCards }) => {
//   const [isAdding, setIsAdding] = useState(false);
//   const [text, setText] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!text.trim()) {
//         setIsAdding(false);
//         return;
//     }
//     const newCard: CardType = {
//       id: Math.random().toString(),
//       ticketId: `WEB-${Math.floor(Math.random() * 1000)}`, // Randoom
//       title: text,
//       column,
//       priority: 2,
//     };
//     setCards((prev) => [...prev, newCard]);
//     setText("");
//     setIsAdding(false);
//   };

//   return isAdding ? (
//     <motion.form layout onSubmit={handleSubmit} className="mt-2">
//       <textarea
//         autoFocus
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         onKeyDown={(e) => {
//             if(e.key === "Enter" && !e.shiftKey) handleSubmit(e);
//             if(e.key === "Escape") setIsAdding(false);
//         }}
//         placeholder="What needs to be done?"
//         className="w-full rounded border border-blue-400 bg-white p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//         rows={3}
//       />
//       <div className="flex items-center gap-2 mt-2">
//           <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium">Add</button>
//           <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 font-medium">Cancel</button>
//       </div>
//     </motion.form>
//   ) : (
//     <motion.button
//       layout
//       onClick={() => setIsAdding(true)}
//       className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
//     >
//       <FiPlus />
//       <span>Create issue</span>
//     </motion.button>
//   );
// };

// const TrashBin: React.FC<{ setCards: React.Dispatch<React.SetStateAction<CardType[]>> }> = ({ setCards }) => {
//   const [active, setActive] = useState(false);

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     const cardId = e.dataTransfer.getData("cardId");
//     setCards((prev) => prev.filter((c) => c.id !== cardId));
//     setActive(false);
//   };

//   return (
//     <div
//       onDragOver={(e) => {
//         e.preventDefault();
//         setActive(true);
//       }}
//       onDragLeave={() => setActive(false)}
//       onDrop={handleDrop}
//       className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-xl transition-all duration-300 z-50 ${
//         active
//           ? "bg-red-600 text-white scale-110 shadow-red-500/50"
//           : "bg-white text-slate-500 border border-slate-200 translate-y-24 opacity-0 pointer-events-none drag-visible-target" // Add class to show this when dragging starts (requires global CSS or state)
//       }`}
      
//       style={{ opacity: active ? 1 : 0.5, transform: active ? 'translate(-50%, 0)' : 'translate(-50%, 150px)' }} 
//     >
//       <FiTrash className="text-lg" />
//       <span className="font-medium">Drop to remove</span>
//     </div>
//   );
// };


// components/AddTask.tsx
"use client";

import { useEffect, useState } from "react";

interface Task {
  task_id: string;
  project_id: string;
  asignee: string;
  title: string;
  content: string;
}

export default function CustomKanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
   const [task_id, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch("/api/users/kanban");
      const data = await res.json();
      setTasks(data.data); // because your API returns { message, data }
    };
    fetchTasks();
  }, []);

  // Add new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTask: Task = {
      task_id: "1",
      project_id: "project123",
      asignee: "Unassigned",
      title,
      content,
    };

    const res = await fetch("/api/users/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    const data = await res.json();
    if (res.ok) {
      setTasks((prev) => [...prev, data.data]); 
      setTitle("");
      setContent("");
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Task ID"
          value={task_id}
          onChange={(e) => setTaskId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Task content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Kanban Board */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <div>
          <h3>To Do</h3>
          <ul>
            {tasks.map((task) => (
              <li key={task.task_id}>
                <strong>{task.title}</strong>
                <p>{task.content}</p>
              </li>
            ))}
          </ul>
        </div>
        {/* Later you can add "In Progress" and "Done" columns */}
      </div>
    </div>
  );
}