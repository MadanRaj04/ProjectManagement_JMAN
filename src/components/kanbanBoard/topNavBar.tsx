import React from "react";
import { FiBell, FiChevronDown, FiHelpCircle, FiMenu, FiSettings } from "react-icons/fi";

export const TopNavbar: React.FC<{ onHamburger: () => void }> = ({ onHamburger }) => (
  <header className="h-12 bg-[#0C1B33] flex items-center px-3 gap-4 shrink-0 z-30">
    {/* Hamburger */}
    <button
      onClick={onHamburger}
      className="text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors"
      aria-label="Toggle sidebar"
    >
      <FiMenu className="text-lg" />
    </button>

    <div className="flex items-center gap-1.5 shrink-0">
      {/* <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
          <path d="M11.50 2c0 2.4 1.97 4.35 4.35 4.35H17.7v1.8c0 2.4 1.96 4.34 4.35 4.35V2.93a.93.93 0 0 0-.92-.93H11.53zm-4.7 4.68c0 2.4 1.97 4.35 4.35 4.35h1.82v1.81a4.35 4.35 0 0 0 4.35 4.35V7.6a.93.93 0 0 0-.93-.93H6.83zm-4.7 4.68c0 2.4 1.97 4.35 4.35 4.35h1.82v1.82a4.35 4.35 0 0 0 4.35 4.34v-9.58a.93.93 0 0 0-.93-.93H2.13z" />
        </svg>
      </div> */}
      <span className="text-white font-bold text-sm hidden sm:block">Project X</span>
    </div>

    {/* Nav links */}
    <nav className="hidden md:flex items-center gap-1 ml-2">
      {["Your work", "Projects", "Filters", "Dashboards", "People", "Apps"].map((item) => (
        <button
          key={item}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded transition-colors ${
            item === "Projects"
              ? "text-blue-300 font-semibold border-b-2 border-blue-400"
              : "text-slate-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {item}
          {["Projects", "Filters", "Dashboards", "Apps"].includes(item) && (
            <FiChevronDown className="text-xs opacity-70" />
          )}
        </button>
      ))}
    </nav>

    {/* Spacer */}
    <div className="flex-1" />


    {/* Icon buttons */}
    <div className="flex items-center gap-1">
      <IconBtn icon={<FiBell />} />
      <IconBtn icon={<FiHelpCircle />} />
      <IconBtn icon={<FiSettings />} />
    </div>

    {/* Avatar */}
    <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/20 cursor-pointer">
      JD
    </div>
  </header>
);

const IconBtn: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <button className="text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors text-lg">
    {icon}
  </button>
);