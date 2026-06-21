import React from "react";
import { Database } from "lucide-react";

export default function Navbar({ backendOnline }) {
  return (
    <header className="bg-slate-50/85 backdrop-blur-md border-b border-slate-200/40 px-10 py-5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3.5">
        <div className="p-2.5 bg-indigo-55/10 border border-indigo-100 rounded-xl">
          <Database className="w-5.5 h-5.5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            AI SQL Query Generator
            <span className="text-[10px] font-bold py-0.5 px-2 bg-indigo-50 text-indigo-600 border border-indigo-100/60 rounded-full">
              v1.0
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-0.5">SaaS Analytics Database Workspace</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border-none ${
          backendOnline 
            ? "bg-emerald-500/10 text-emerald-700" 
            : "bg-rose-500/10 text-rose-700"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
          {backendOnline ? "System Online" : "System Offline"}
        </span>
      </div>
    </header>
  );
}
