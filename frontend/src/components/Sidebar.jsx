import React from "react";
import { History, Loader2 } from "lucide-react";

export default function Sidebar({
  history,
  historyLoading,
  historyError,
  onLoadHistoryItem
}) {
  return (
    <aside className="w-80 bg-brutalCharcoal text-white flex flex-col h-full shrink-0 border-r-2 border-black font-satoshi overflow-hidden select-none z-30">
      
      {/* 1. Permanently Prominent Query History Header & Container */}
      <div className="p-3.5 bg-[#202722] border-b-2 border-black flex items-center justify-between shrink-0 font-extrabold uppercase tracking-wider text-xs">
        <span className="flex items-center gap-2">
          <History className="w-4 h-4 text-brutalYellow" />
          Query History
        </span>
        <span className="text-[9px] font-mono bg-white text-black border-2 border-black px-1.5 py-0.2 shadow-brutal-sm font-bold">
          {history.length} Logs
        </span>
      </div>

      <div className="flex-grow overflow-y-auto p-3 space-y-2 bg-[#171e19]">
        {historyLoading && history.length === 0 ? (
          <div className="flex items-center justify-center py-20 gap-2">
            <Loader2 className="w-4 h-4 text-[#b7c6c2] animate-spin" />
            <span className="text-[10px] font-bold">Loading...</span>
          </div>
        ) : historyError ? (
          <p className="text-[10px] text-red-400 font-bold p-2 text-center bg-red-950/20">{historyError}</p>
        ) : history.length === 0 ? (
          <p className="text-[10px] text-[#b7c6c2] text-center py-20 leading-relaxed">No logged queries yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onLoadHistoryItem(item)}
                className="w-full text-left p-2.5 bg-white text-black border-2 border-black hover:translate-x-0.5 hover:translate-y-0.5 shadow-brutal hover:shadow-brutal-sm transition-all flex flex-col space-y-1.5"
              >
                <div className="flex justify-between items-start w-full gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-extrabold uppercase text-black/50 bg-[#eef3f1] border border-black/10 px-1 py-0.2 self-start tracking-wider">
                      {item.db_name || "ai_sql_generator"}
                    </span>
                    <p className="text-[11px] font-extrabold line-clamp-2 leading-relaxed text-black">
                      {item.prompt}
                    </p>
                  </div>
                  <span className="text-[8px] text-black/55 font-mono font-bold shrink-0 mt-0.5">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <pre className="text-[9px] font-mono text-black/70 line-clamp-1 truncate w-full select-none bg-[#f5f5f5] p-1 border border-black/5">
                  {item.sql_query}
                </pre>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
