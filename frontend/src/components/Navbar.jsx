import React from "react";
import { Zap, Bell, User, Search, RefreshCw, Layers } from "lucide-react";

export default function Navbar({
  backendOnline,
  activeModel,
  setActiveModel,
  activeDatabase,
  setActiveDatabase,
  searchTerm,
  setSearchTerm
}) {
  const models = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" }
  ];

  const databases = [
    { id: "mysql-local", name: "MySQL Local" },
    { id: "postgres-staging", name: "PostgreSQL Staging" },
    { id: "sqlite-sandbox", name: "SQLite Sandbox" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-brutalYellow border-b-2 border-black flex items-center justify-between px-6 z-50 font-satoshi select-none">
      {/* Left Area: Logo & App Title */}
      <div className="flex items-center gap-4">
        {/* 10x10 square (represented in tailwind as a styled block w-10 h-10) with yellow bolt icon */}
        <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-brutal-sm">
          <Zap className="w-5 h-5 text-brutalYellow fill-current" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-black uppercase tracking-tight flex items-center gap-1.5">
            AI SQL Query Generator
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-black text-brutalYellow border border-black rounded-none hidden md:inline">
              v1.0
            </span>
          </h1>
          <p className="text-[9px] font-bold text-black uppercase tracking-widest leading-none mt-0.5 opacity-70">
            Neo-Brutalist Query Sandbox
          </p>
        </div>
      </div>

      {/* Middle/Center: DB, AI Model, and Status Badges */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Database Selector */}
        <div className="flex items-center bg-white border-2 border-black px-2.5 py-1 shadow-brutal-sm">
          <Layers className="w-3.5 h-3.5 mr-1.5" />
          <select
            value={activeDatabase}
            onChange={(e) => setActiveDatabase(e.target.value)}
            className="bg-transparent text-xs font-bold text-black border-none focus:outline-none focus:ring-0 cursor-pointer p-0 pr-6"
          >
            {databases.map((db) => (
              <option key={db.id} value={db.id} className="bg-white text-black font-bold">
                {db.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI Engine Model Dropdown */}
        <div className="flex items-center bg-white border-2 border-black px-2.5 py-1 shadow-brutal-sm">
          <Zap className="w-3.5 h-3.5 mr-1.5 text-black" />
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            className="bg-transparent text-xs font-bold text-black border-none focus:outline-none focus:ring-0 cursor-pointer p-0 pr-6"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-white text-black font-bold">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Connection Status Badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black text-[9px] font-extrabold tracking-wider uppercase bg-white shadow-brutal-sm ${
          backendOnline ? "text-black" : "text-red-700 bg-red-50"
        }`}>
          <span className={`w-2 h-2 border border-black ${backendOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {backendOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Right Area: Search, Notify & Profile */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden md:flex items-center bg-white border-2 border-black px-2 py-1 shadow-brutal-sm">
          <input
            type="text"
            placeholder="Quick search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-bold text-black placeholder-black/50 border-none focus:outline-none focus:ring-0 w-32 xl:w-48 p-0"
          />
          <Search className="w-3.5 h-3.5 ml-1 text-black" />
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm hover:bg-brutalSage hover:translate-y-0.5 active:translate-y-1 transition-all">
          <Bell className="w-4 h-4 text-black" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 bg-black text-white border-2 border-black px-2 py-1 shadow-brutal-sm hover:bg-brutalSage hover:text-black transition-all hover:translate-y-0.5">
          <div className="w-5 h-5 bg-brutalYellow border border-black flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-xs font-extrabold tracking-wider uppercase hidden sm:inline">Admin</span>
        </button>
      </div>
    </header>
  );
}
