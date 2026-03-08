import { CardType } from "@/src/data/interfaces";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiTrash } from "react-icons/fi";

export const TrashBin: React.FC<{
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  setBinCards: React.Dispatch<React.SetStateAction<CardType[]>>;
}> = ({ setCards, setBinCards }) => {
  const [active, setActive] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setActive(true); }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        const id = e.dataTransfer.getData("cardId");
        setCards((prev) => {
          const card = prev.find((c) => c.id === id);
          if (card) {
            // ✅ Move to bin only if not already there
            setBinCards((bin) => {
              const alreadyInBin = bin.some((c) => c.id === card.id);
              if (alreadyInBin) return bin;
              return [...bin, card];
            });
          }
          return prev.filter((c) => c.id !== id);
        });
        setActive(false);
      }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-xl z-50 transition-all duration-200 cursor-pointer ${
        active
          ? "bg-red-600 text-white scale-110 shadow-red-400/40"
          : "bg-white text-slate-500 border border-slate-200 hover:border-red-300"
      }`}
    >
      <FiTrash className="text-lg" />
      <span className="text-sm font-medium">Drop to delete</span>
    </div>
  );
};

// ─── BinViewer ─────────────────────────────────────────────────────────────
export const BinViewer: React.FC<{
  binCards: CardType[];
  setBinCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
}> = ({ binCards, setBinCards, setCards }) => {
  const [open, setOpen] = useState(false);

  const restore = (card: CardType) => {
    setCards((prev) => {
      // ✅ Guard: only add back if not already present
      const alreadyExists = prev.some((c) => c.id === card.id);
      if (alreadyExists) return prev;
      return [...prev, card];
    });
    setBinCards((prev) => prev.filter((c) => c.id !== card.id));
  };

  const deletePermanently = (id: string) => {
    setBinCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      {/* Bin toggle button with badge */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-8 right-8 flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-slate-200 shadow-xl text-slate-500 hover:border-red-300 z-50 transition-colors"
      >
        <FiTrash />
        {binCards.length > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {binCards.length}
          </span>
        )}
      </button>

      {/* Bin drawer/panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-24 right-8 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Bin ({binCards.length})</h3>
              <button
                onClick={() => setBinCards([])}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {binCards.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Bin is empty</p>
              ) : (
                binCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                      <span className="text-sm text-slate-600 truncate">{card.title}</span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide">
                        {card.ticketId}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => restore(card)}
                        className="text-xs text-green-500 hover:text-green-700 font-medium transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => deletePermanently(card.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};