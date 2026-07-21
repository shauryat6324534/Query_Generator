import React from "react";
import { Sparkles, Terminal, X } from "lucide-react";

export default function IntroductionCard({ onClose }) {
  return (
    <div className="w-full bg-brutalYellow border-brutal shadow-brutal-lg brutal-dots p-5 relative rounded-none md:rounded-lg text-black font-satoshi">
      {/* Dismiss Button */}
      <button 
        onClick={onClose}
        className="absolute top-2.5 right-2.5 w-7 h-7 bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer active:translate-y-1"
        title="Dismiss Introduction"
      >
        <X className="w-4 h-4 text-black stroke-[3px]" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pr-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border-2 border-black text-[10px] font-extrabold uppercase tracking-wider shadow-brutal-sm">
            <Sparkles className="w-3.5 h-3.5 text-black fill-current animate-pulse" />
            <span>AI SQL Query Workspace v2.0</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tighter uppercase">
            Build, optimize, and execute SQL in plain English.
          </h2>
          <p className="text-xs font-semibold text-black max-w-2xl leading-relaxed opacity-95">
            Describe what data you want to retrieve or alter. Generate code, explain logic, validate risk vectors, check MySQL plan metrics, and run queries directly in your sandbox workspace.
          </p>
        </div>
        
        <div className="bg-white border-2 border-black shadow-brutal p-3 flex flex-col gap-1 min-w-[180px] shrink-0 self-start md:self-auto text-black">
          <span className="text-[9px] text-black/55 uppercase font-extrabold tracking-wider leading-none">Catalog Connection</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Terminal className="w-3.5 h-3.5 text-black" />
            <span className="font-extrabold text-xs">production_db_replica</span>
          </div>
        </div>
      </div>
    </div>
  );
}
