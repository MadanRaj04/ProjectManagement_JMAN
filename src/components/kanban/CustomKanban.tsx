"use client";

import React, { useEffect, useState } from "react";
import { 
  FiPlus, 
  FiTrash, 
  FiSearch, 
  FiMoreHorizontal, 
  FiArrowUp, 
  FiArrowDown, 
  FiMinus, 
  FiSidebar,
  FiFilter
} from "react-icons/fi";
import { FaJira } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TaskDetail from "../taskDetail/Task"; 
import { Task, CardType, ColumnType, PriorityLevel } from "../../interfaces/interfaces";

const COLUMN_COLORS = {
  backlog: "border-t-4 border-t-slate-400",
  todo: "border-t-4 border-t-blue-500",
  doing: "border-t-4 border-t-amber-500",
  done: "border-t-4 border-t-emerald-500",
};

// --- Main Component ---
export const CustomKanban: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-white text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />
        <Board />
      </div>
    </div>
  );
};

// --- Sub-Components ---
const Sidebar = () => {
  return (
    <div className="w-16 lg:w-64 bg-[#091E42] text-white flex flex-col shrink-0 transition-all duration-300 border-r border-slate-200">
      <div className="h-14 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
        <FaJira className="text-2xl" />
        <span className="ml-3 font-bold text-lg hidden lg:block">Task management</span>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Planning
        </div>
        <SidebarItem icon={<FiSidebar />} label="Board" active />
        <SidebarItem icon={<FiPlus />} label="Create Issue" />
        <SidebarItem icon={<FiSearch />} label="Search" />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${active ? 'bg-white/10 text-blue-300' : 'hover:bg-white/5 text-slate-300'}`}>
    <span className="text-xl">{icon}</span>
    <span className="hidden lg:block text-sm font-medium">{label}</span>
  </div>
);

const TopBar = () => {
  return (
    <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800">Web Development Sprint 24</h1>
        <span className="text-slate-400 text-sm">|</span>
        <div className="flex -space-x-2">
           <Avatar initials="JD" color="bg-blue-500" />
           <Avatar initials="AL" color="bg-purple-500" />
           <Avatar initials="PR" color="bg-emerald-500" />
           <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-bold">+2</div>
        </div>
      </div>
    </div>
  );
};

const Board: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<CardType | null>(null);

  useEffect(() => {
    const fetchRealCards = async () => {
      try {
        const res = await fetch("/api/users/kanban"); 
        
        if (res.ok) {
          const result = await res.json();
          setCards(result.data || []);
        } else {
          console.error("Server returned an error");
        }
      } catch (error) {
        console.error("Failed to connect to the server:", error);
      }
    };
    fetchRealCards();
  }, []);

  // Filtering of tasks while searching them
  const filteredCards = cards.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
      {/* Board Header / Search */}
      <div className="p-4 px-6 flex items-center gap-4">
        <div className="relative group w-64">
           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
           <input 
             type="text" 
             placeholder="Search board..." 
             className="w-full bg-transparent border-2 border-slate-200 rounded px-10 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4">
        <div className="flex h-full gap-4 min-w-max">
          {(["backlog", "todo", "doing", "done"] as ColumnType[]).map((col) => (
            <Column
              key={col}
              title={col}
              column={col}
              cards={filteredCards}
              setCards={setCards}
              onCardClick={setSelectedTask}
            />
          ))}
        </div>
      </div>

      {/* Floating Trash Bin */}
      <TrashBin setCards={setCards} />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

const Column: React.FC<{
  title: string;
  column: ColumnType;
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  onCardClick: (card: CardType) => void;
}> = ({ title, column, cards, setCards, onCardClick }) => {
  const [active, setActive] = useState(false);
  const filteredCards = cards.filter((c) => c.column === column);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, column } : c)));
    setActive(false);
  };

  // Maps for prettier display names
  const titleMap: Record<string, string> = {
    backlog: "Backlog",
    todo: "Development",
    doing: "In Progress",
    done: "Completed",
  };

  return (
    <div className="w-[280px] flex flex-col shrink-0 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className={`font-semibold text-xs text-slate-500 uppercase tracking-wide`}>
          {titleMap[column]} <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{filteredCards.length}</span>
        </h3>
        <div className="flex gap-1">
           <button className="text-slate-400 hover:text-slate-600"><FiMoreHorizontal /></button>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setActive(true);
        }}
        onDragLeave={() => setActive(false)}
        onDrop={handleDrop}
        className={`flex-1 bg-[#F4F5F7] rounded-lg p-2 flex flex-col gap-2 overflow-y-auto transition-colors duration-200 ${
          active ? "bg-blue-50 ring-2 ring-blue-300 ring-inset" : ""
        }`}
      >
        <AnimatePresence>
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              {...card}
              onCardClick={onCardClick}
              handleDragStart={handleDragStart}
            />
          ))}
        </AnimatePresence>
        
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

// We include 'content' here, but it might be undefined since it is optional now
const Card: React.FC<CardType & { 
  onCardClick: (card: CardType) => void; 
  handleDragStart: Function 
}> = ({ id, ticketId, title, content, column, priority, assignee, onCardClick, handleDragStart }) => {
  return (
    <motion.div
      layout
      layoutId={id}
      draggable
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
      onClick={() => onCardClick({ id, ticketId, title, content, column, priority, assignee })}
      onDragStart={(e) => handleDragStart(e, { id })}
      className="cursor-grab active:cursor-grabbing bg-white p-3 rounded shadow-sm border border-slate-200 hover:border-blue-400 group"
    >
      <div className="flex flex-col mb-2">
        <p className="text-sm text-slate-800 leading-snug font-medium">{title}</p>
        
        {/* THIS IS THE MAGIC CHECK: It only shows the content text if 'content' actually exists! */}
        {content && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{content}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <PriorityIcon priority={priority} />
          <span className="text-[10px] font-bold text-slate-400 uppercase">{ticketId}</span>
        </div>
        
        {assignee && (
           <Avatar initials={assignee} size="w-6 h-6 text-[10px]" />
        )}
      </div>
    </motion.div>
  );
};

const PriorityIcon = ({ priority }: { priority: PriorityLevel }) => {
  if (priority === 1) return <div className="bg-red-100 p-0.5 rounded"><FiArrowUp className="text-red-600 text-xs" /></div>;
  if (priority === 2) return <div className="bg-amber-100 p-0.5 rounded"><FiMinus className="text-amber-600 text-xs" /></div>;
  return <div className="bg-blue-100 p-0.5 rounded"><FiArrowDown className="text-blue-600 text-xs" /></div>;
};

const Avatar = ({ initials, color = "bg-blue-500", size = "w-8 h-8 text-xs" }: { initials: string, color?: string, size?: string }) => (
    <div className={`${size} rounded-full ${color} text-white flex items-center justify-center font-bold ring-2 ring-white`}>
        {initials}
    </div>
)

const AddCard: React.FC<{ column: ColumnType; setCards: React.Dispatch<React.SetStateAction<CardType[]>> }> = ({ column, setCards }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [contentText, setContentText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/users/kanban");
        if (res.ok) {
           const data = await res.json();
           setTasks(data.data || []); 
        }
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    // The Title is required, so we check that first
    if (!titleText.trim()) {
        setIsAdding(false);
        return;
    }

    const newCard: CardType = {
      id: Math.random().toString().substring(2,3),
      ticketId: `WEB-${Math.floor(Math.random() * 1000)}`, 
      title: titleText,
      content: contentText, // This will just be empty string if they didn't type anything
      column,
      priority: 2,
    };

    try {
      const res = await fetch("/api/users/kanban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });

      if (res.ok) {
        const data = await res.json();
        // Add it to our local board so we can see it right away!
        setCards((prev) => [...prev, data.newCard || newCard]); 
        
        // Clear out the text boxes
        setTitleText("");
        setContentText("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Error creating task", error);
      // Fallback: Add it to the board even if API fails locally (for testing)
      setCards((prev) => [...prev, newCard]);
      setTitleText("");
      setContentText("");
      setIsAdding(false);
    }
  };

  return isAdding ? (
    <motion.form layout onSubmit={handleAddTask} className="mt-2 flex flex-col gap-2">
      {/* Required Title Box */}
      <input
        autoFocus
        value={titleText}
        onChange={(e) => setTitleText(e.target.value)}
        placeholder="Task Title (Required)"
        className="w-full rounded border border-blue-400 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        required
      />
      {/* Optional Content Box */}
      <textarea
        value={contentText}
        onChange={(e) => setContentText(e.target.value)}
        placeholder="Details (Optional)"
        className="w-full rounded border border-slate-300 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        rows={2}
      />
      
      <div className="flex items-center gap-2 mt-1">
          <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium transition-colors">Add</button>
          <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 font-medium transition-colors">Cancel</button>
      </div>
    </motion.form>
  ) : (
    <motion.button
      layout
      onClick={() => setIsAdding(true)}
      className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
    >
      <FiPlus />
      <span>Create issue</span>
    </motion.button>
  );
};

const TrashBin: React.FC<{ setCards: React.Dispatch<React.SetStateAction<CardType[]>> }> = ({ setCards }) => {
  const [active, setActive] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setActive(false);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-xl transition-all duration-300 z-50 ${
        active
          ? "bg-red-600 text-white scale-110 shadow-red-500/50"
          : "bg-white text-slate-500 border border-slate-200 translate-y-24 opacity-0 pointer-events-none drag-visible-target" 
      }`}
      style={{ opacity: active ? 1 : 0.5, transform: active ? 'translate(-50%, 0)' : 'translate(-50%, 150px)' }} 
    >
      <FiTrash className="text-lg" />
      <span className="font-medium">Drop to remove</span>
    </div>
  );
};