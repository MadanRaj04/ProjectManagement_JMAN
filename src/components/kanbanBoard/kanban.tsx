"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiChevronDown,
  FiStar,
  FiMoreHorizontal,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import TaskDetail from "../taskDetail/Task";
import { CardType, ColumnType, Member } from "../../data/interfaces";
import { Sidebar } from "./sidebar";
import { AddCard } from "./card";
import { BinViewer, TrashBin } from "./trashBin";
import { TopNavbar }  from "./topNavBar";

// ─── Main Component ────────────────────────────────────────────────────────
export const CustomKanban: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [members, setMembers] = useState<Member[]>([]); // ✅ Fix 1: state lives here, not in Board

  // ✅ Fix 2: toggleMember is properly closed with }; 
  const toggleMember = (member: Member) => {
    setMembers((prev) => {
      const exists = prev.some((m) => m.initials === member.initials);
      if (exists) return prev.filter((m) => m.initials !== member.initials);
      return [...prev, member];
    });
  }; // ✅ was missing this closing brace

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <TopNavbar onHamburger={() => setSidebarOpen((p) => !p)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} members={members} onToggleMember={toggleMember} />
        <Board members={members} /> {/* ✅ Fix 3: members passed as prop */}
      </div>
    </div>
  );
};

// ─── Board ─────────────────────────────────────────────────────────────────
// ✅ Fix 3: Board accepts members as a prop instead of managing its own state
const Board: React.FC<{ members: Member[] }> = ({ members }) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [binCards, setBinCards] = useState<CardType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<CardType | null>(null);

  const MAX_VISIBLE = 5;
  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch("/api/users/kanban");
        if (res.ok) {
          const result = await res.json();
          const raw: CardType[] = result.data || [];
          const unique = raw.filter(
            (card, index, self) => self.findIndex((c) => c.id === card.id) === index
          );
          setCards(unique);
        }
      } catch (err) {
        console.error("Failed to fetch cards:", err);
      }
    };
    fetchCards();
  }, []);

  const filtered = cards.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F8F9]">
      {/* Sub-header */}
      <div className="px-8 pt-5 pb-2 bg-white border-b border-slate-200">
        <p className="text-xs text-slate-500 mb-1">
          Projects / <span className="text-slate-700">Nucleus</span>
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">Board</h1>
          <FiStar className="text-slate-400 hover:text-amber-400 cursor-pointer transition-colors" />
          <FiMoreHorizontal className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors ml-auto" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 bg-white border-b border-slate-100 flex items-center gap-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-44 transition-colors"
          />
        </div>

        {/* ✅ Fix 4: Dynamic avatar cluster driven by members prop */}
        <div className="flex -space-x-2">
          <AnimatePresence>
            {visible.map((m) => (
              <motion.div
                key={m.initials}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                title={`${m.name} — ${m.role}`}
                className={`w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white cursor-pointer hover:scale-110 transition-transform ${m.color}`}
              >
                {m.initials}
              </motion.div>
            ))}
          </AnimatePresence>

          {overflow > 0 && (
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              +{overflow}
            </div>
          )}

          {members.length === 0 && (
            <span className="text-xs text-slate-400 self-center">No members</span>
          )}
        </div>

        <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-300 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors">
          Epic <FiChevronDown className="text-xs" />
        </button>

        <div className="flex-1" />

        <span className="text-xs text-slate-500 font-medium">GROUP BY</span>
        <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-300 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors">
          None <FiChevronDown className="text-xs" />
        </button>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-5 h-full min-w-max">
          {(["todo", "development", "doing", "done"] as ColumnType[]).map((col) => (
            <Column
              key={col}
              column={col}
              cards={filtered}
              setCards={setCards}
              onCardClick={setSelectedTask}
            />
          ))}

          <button className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors shrink-0 self-start mt-6">
            <FiPlus className="text-lg" />
          </button>
        </div>
      </div>

      <TrashBin setCards={setCards} setBinCards={setBinCards} />
      <BinViewer binCards={binCards} setBinCards={setBinCards} setCards={setCards} />

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

// ─── Column ────────────────────────────────────────────────────────────────
const COLUMN_LABELS: Record<ColumnType, string> = {
  todo: "TO DO",
  development: "DEVELOPMENT",
  doing: "IN PROGRESS",
  done: "DONE",
};

const Column: React.FC<{
  column: ColumnType;
  cards: CardType[];
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  onCardClick: (card: CardType) => void;
}> = ({ column, cards, setCards, onCardClick }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const filtered = cards.filter((c) => c.column === column);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, column } : c)));
    setIsDragOver(false);
  };

  return (
    <div className="w-72 flex flex-col shrink-0 h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {COLUMN_LABELS[column]}
        </h3>
        <span className="text-xs font-bold text-slate-500">{filtered.length}</span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex-1 rounded-lg flex flex-col gap-2 overflow-y-auto p-2 transition-all duration-150 ${
          isDragOver ? "bg-blue-50 ring-2 ring-blue-300 ring-inset" : "bg-[#EBECF0]"
        }`}
      >
        <AnimatePresence>
          {filtered.map((card) => (
            <Card key={card.id} {...card} onCardClick={onCardClick} setCards={setCards} />
          ))}
        </AnimatePresence>
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────────
const Card: React.FC<
  CardType & {
    onCardClick: (card: CardType) => void;
    setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  }
> = ({ id, ticketId, title, content, column, priority, assignee, onCardClick, setCards }) => {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("cardId", id);
    e.dataTransfer.effectAllowed = "move";
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(ref.current, e.clientX - rect.left, e.clientY - rect.top);
    }
    requestAnimationFrame(() => setIsDragging(true));
  };

  return (
    <motion.div
      ref={ref}
      layout
      layoutId={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => !isDragging && onCardClick({ id, ticketId, title, content, column, priority, assignee })}
      className="bg-white rounded shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md p-3 cursor-pointer select-none transition-shadow group"
    >
      <p className="text-sm text-slate-800 font-normal leading-snug mb-3">{title}</p>

      <div className="flex items-center gap-2">
        <div
          className={`w-4 h-4 rounded-sm shrink-0 flex items-center justify-center ${
            priority === 3 ? "bg-red-500" : priority === 2 ? "bg-orange-400" : "bg-green-500"
          }`}
        >
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-white">
            <path d="M5 1L9 5L5 9L1 5Z" />
          </svg>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex-1">
          {ticketId}
        </span>

        <PriorityIcon priority={priority} />

        {assignee && (
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white">
            {assignee}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── PriorityIcon ──────────────────────────────────────────────────────────
// ✅ Fix 4: removed the stray }; that was incorrectly appended at the end
const PriorityIcon = ({ priority }: { priority: number }) => {
  const level = Number(priority);
  if (level === 3)
    return (
      <span className="flex items-center gap-0.5 text-red-500 text-xs">
        <FiArrowUp />
      </span>
    );
  if (level === 2)
    return (
      <span className="flex items-center gap-0.5 text-orange-400 text-xs">
        <FiMinus />
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-slate-400 text-xs">
      <FiArrowDown />
    </span>
  );
};