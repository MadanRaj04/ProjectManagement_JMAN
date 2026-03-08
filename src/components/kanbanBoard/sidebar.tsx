"use client";

import React, { useState } from "react";
import {
  FiMap,
  FiLayout,
  FiCode,
  FiPhone,
  FiFileText,
  FiPlusSquare,
  FiSettings,
  FiCheck,
  FiX,
  FiUserPlus,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Member } from "@/src/data/interfaces";
import { DEFAULT_USERS } from "@/src/data/Users";
// ✅ Fix 3: Removed wrong `import { Avatar } from "radix-ui"` — replaced with inline div

// ─── Types ─────────────────────────────────────────────────────────────────
type NavItem = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void; // ✅ Fix 1: added onClick so Add User can trigger modal
};

// ─── Add User Modal ────────────────────────────────────────────────────────
// ✅ Fix 2: Moved AddUserModal OUTSIDE Sidebar
//    Defining a component inside another causes it to remount on every render
const AddUserModal: React.FC<{
  members: Member[];
  onToggle: (user: Member) => void;
  onClose: () => void;
}> = ({ members, onToggle, onClose }) => {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-[100]"
      />

      {/* Modal panel */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.15 }}
        className="fixed left-56 top-1/3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[101] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FiUserPlus className="text-blue-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Add team members</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX />
          </button>
        </div>

        {/* User list */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {DEFAULT_USERS.map((user) => {
            const isAdded = members.some((m) => m.initials === user.initials);
            return (
              <button
                key={user.initials}
                onClick={() => onToggle(user)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                {/* ✅ Fix 3: Inline avatar div instead of broken <Avatar user={user} /> */}
                <div
                  className={`w-8 h-8 rounded-full ${user.color} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                >
                  {user.initials}
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>

                {/* Added indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isAdded ? "bg-blue-500 text-white" : "border-2 border-slate-200"
                  }`}
                >
                  {isAdded && <FiCheck className="text-[11px]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {members.length} member{members.length !== 1 ? "s" : ""} added
          </span>
          <button
            onClick={onClose}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────
export const Sidebar: React.FC<{
  isOpen: boolean;
  members: Member[];
  onToggleMember: (u: Member) => void;
}> = ({ isOpen, members, onToggleMember }) => {
  const [showModal, setShowModal] = useState(false);

  // ✅ Fix 4: NAV_ITEMS moved inside Sidebar so onClick can close over setShowModal
  const NAV_ITEMS: NavItem[] = [
    { icon: <FiMap />,      label: "Roadmap" },
    { icon: <FiLayout />,   label: "Board", active: true },
    { icon: <FiCode />,     label: "Code" },
    { icon: <FiPhone />,    label: "On-call" },
    { icon: <FiFileText />, label: "Pages" },
    {
      icon: <FiPlusSquare />,
      label: "Add User",
      onClick: () => setShowModal(true),
    },
  ];

  const BOTTOM_ITEMS: NavItem[] = [
    { icon: <FiSettings />, label: "Project settings" },
  ];

  return (
    <>
      <motion.aside
        animate={{ width: isOpen ? 220 : 48 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="h-full bg-white flex flex-col shrink-0 overflow-hidden border-r border-slate-200 relative z-20"
      >
        {/* Project Header */}
        <div className="flex items-center gap-3 px-3 py-4 shrink-0 min-h-16">
          <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center shrink-0 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19ZM5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5ZM21.61 2.39C21.61 2.39 16.66.27 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.79 17.45 10.61 17.63 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39ZM14.54 9.46C13.76 8.68 13.76 7.41 14.54 6.63C15.32 5.85 16.59 5.85 17.37 6.63C18.15 7.41 18.15 8.68 17.37 9.46C16.59 10.24 15.32 10.24 14.54 9.46ZM8.88 16.53L7.47 15.12L8.88 16.53Z" />
            </svg>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-bold text-slate-800 whitespace-nowrap leading-tight">
                  Nucleus
                </p>
                <p className="text-xs text-slate-500 whitespace-nowrap">
                  Software project
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 space-y-0.5 px-1">
          {NAV_ITEMS.map((item) => (
            <NavRow key={item.label} item={item} isOpen={isOpen} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-1 py-2 border-t border-slate-100 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavRow key={item.label} item={item} isOpen={isOpen} />
          ))}
        </div>
      </motion.aside>

      {/* ✅ Fix 5: Modal rendered outside <aside> so it isn't clipped by overflow-hidden */}
      {showModal && (
        <AddUserModal
          members={members}
          onToggle={onToggleMember}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

// ─── NavRow ────────────────────────────────────────────────────────────────
const NavRow: React.FC<{ item: NavItem; isOpen: boolean }> = ({ item, isOpen }) => (
  <button
    onClick={item.onClick} // ✅ Fix 1: onClick now wired up
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group ${
      item.active
        ? "bg-blue-50 text-blue-700 font-semibold"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    <span
      className={`text-base shrink-0 ${
        item.active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
      }`}
    >
      {item.icon}
    </span>
    <AnimatePresence>
      {isOpen && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="whitespace-nowrap text-[13px] overflow-hidden"
        >
          {item.label}
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);