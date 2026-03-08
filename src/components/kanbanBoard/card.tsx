import { CardType, ColumnType } from "@/src/data/interfaces";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";

export const AddCard: React.FC<{
  column: ColumnType;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
}> = ({ column, setCards }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [priority, setPriority] = useState<number>(1);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleText.trim()) { setIsAdding(false); return; }

    const newCard: CardType = {
      id: crypto.randomUUID(),
      ticketId: `NUC-${Math.floor(Math.random() * 900 + 100)}`,
      title: titleText,
      column,
      priority,
    };

    // ✅ Add optimistically once using local id
    setCards((prev) => {
      const alreadyExists = prev.some((c) => c.id === newCard.id);
      if (alreadyExists) return prev;
      return [...prev, newCard];
    });

    setTitleText(""); setPriority(1); setIsAdding(false);

    try {
      const res = await fetch("/api/users/kanban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });

      if (res.ok) {
        const data = await res.json();
        // If server assigned a different id, swap it out
        if (data?.newCard?.id && data.newCard.id !== newCard.id) {
          setCards((prev) =>
            prev.map((c) => (c.id === newCard.id ? data.newCard : c))
          );
        }
      }
    } catch (err) {
      console.error("Failed to save card:", err);
      // Card already added optimistically — no further action needed
    }
  };

  if (isAdding) {
    return (
      <motion.form
        layout
        onSubmit={submit}
        className="bg-white rounded shadow-sm border border-blue-400 p-2 flex flex-col gap-2"
      >
        <input
          autoFocus
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          placeholder="What needs to be done?"
          className="text-sm w-full focus:outline-none text-slate-800 placeholder-slate-400"
          required
        />
        <select
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none text-slate-600"
        >
          <option value={1}>Low priority</option>
          <option value={2}>Medium priority</option>
          <option value={3}>High priority</option>
        </select>
        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-semibold transition-colors"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    );
  }

  return (
    <motion.button
      layout
      onClick={() => setIsAdding(true)}
      className="flex items-center gap-2 w-full px-2 py-2 rounded text-sm text-slate-500 hover:bg-slate-300/50 hover:text-slate-700 transition-colors"
    >
      <FiPlus />
      <span>Create issue</span>
    </motion.button>
  );
};