"use client";

import React, { useState } from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";

import TaskDetail from "../taskDetail/Task";

export const CustomKanban = () => {
  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board />
    </div>
  );
};

const PriorityTag = ({ priority }) => {
  const mapping = {
    1: { label: "High", css: "bg-red-500/20 text-red-400 border-red-500/50" },
    2: { label: "Med", css: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    3: { label: "Low", css: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  };

  const { label, css } = mapping[priority] || mapping[3];

  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase ${css}`}>
      {label}
    </span>
  );
};


const Board = () => {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); // The state for the modal
  
  const filteredCards = cards.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isSearching = searchTerm.length > 0;

return (
    <div className="flex h-full w-full flex-col p-12 relative">
    <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 rounded border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-violet-400 focus:outline-none"
          />
          {/* Clear Search Button */}
          {isSearching && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

        <div className="flex h-full w-full gap-3 overflow-scroll">
            <Column
          title="Backlog"
          column="backlog"
          headingColor="text-neutral-500"
          cards={filteredCards} // Only display matches
          setCards={setCards}   // Still update the master list
          onCardClick={setSelectedTask} // <--- Pass it here
          isSearching={isSearching}
        />
        <Column
          title="TODO"
          column="todo"
          headingColor="text-yellow-200"
          cards={filteredCards}
          setCards={setCards}
          onCardClick={setSelectedTask} // FIX: Add this
          isSearching={isSearching}

        />
        <Column
          title="In progress"
          column="doing"
          headingColor="text-blue-200"
          cards={filteredCards}
          setCards={setCards}
          onCardClick={setSelectedTask} // FIX: Add this
          isSearching={isSearching}
        />
        <Column
          title="Complete"
          column="done"
          headingColor="text-emerald-200"
          cards={filteredCards}
          setCards={setCards}
          onCardClick={setSelectedTask} // FIX: Add this
          isSearching={isSearching}
        />
        <BurnBarrel setCards={setCards} />

      </div>

              <TaskDetail 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
};

const Column = ({ title, headingColor, cards, column, setCards, onCardClick, isSearching }) => {
    const [active, setActive] = useState(false);
  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);

    setActive(true);
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => {
          return <Card key={c.id} {...c} handleDragStart={handleDragStart} onCardClick={onCardClick} />;
        })}
        <DropIndicator beforeId={null} column={column} />
        
        {/* Fix: Hide AddCard when searching to prevent "disappearing" new tasks */}
        {!isSearching && <AddCard column={column} setCards={setCards} />}
      </div>
    </div>
  );
};


const Card = ({ title, id, column, priority, onCardClick, handleDragStart }) => {
  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onClick={() => onCardClick({ title, id, column, priority })} // Pass priority to detail view too
        onDragStart={(e) => handleDragStart(e, { title, id, column, priority })}
        className="cursor-pointer rounded border border-neutral-700 bg-neutral-800 p-3 hover:border-neutral-500 transition-colors"
      >
        {/* Render the PriorityTag here */}
        <div className="mb-2">
          <PriorityTag priority={priority} />
        </div>
        <p className="text-sm text-neutral-100">{title}</p>
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const BurnBarrel = ({ setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setCards((pv) => pv.filter((c) => c.id !== cardId));

    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

    const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim().length) return;

    const newCard = {
        column,
        title: text.trim(),
        id: Math.random().toString(),
        priority: 2, // Defaulting new cards to Medium
    };

    setCards((pv) => [...pv, newCard]);
    setAdding(false);
    };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

const DEFAULT_CARDS = [
  // BACKLOG
{ title: "Look into render bug", id: "1", column: "backlog", priority: 1 },
  { title: "SOX compliance checklist", id: "2", column: "backlog", priority: 2 },
  { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog", priority: 3 },
  { title: "Document Notifications service", id: "4", column: "backlog",priority: 3 },
  // TODO
  {
    title: "Research DB options for new microservice",
    id: "5",
    column: "todo",
    priority: 1
  },
  { title: "Postmortem for outage", id: "6", column: "todo",priority: 2 },
  { title: "Sync with product on Q3 roadmap", id: "7", column: "todo",priority: 1 },

  // DOING
  {
    title: "Refactor context providers to use Zustand",
    id: "8",
    column: "doing"
    ,priority: 3
  },
  { title: "Add logging to daily CRON", id: "9", column: "doing",priority: 1 },
  // DONE
  {
    title: "Set up DD dashboards for Lambda listener",
    id: "10",
    column: "done",
    priority: 2
  },
];