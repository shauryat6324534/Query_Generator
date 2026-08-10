import React, { useState } from "react";
import { History, Loader2, Bookmark, Settings, ChevronRight, ChevronDown } from "lucide-react";

export default function Sidebar({
  history,
  historyLoading,
  historyError,
  onLoadHistoryItem
}) {
  const [openSections, setOpenSections] = useState({
    saved: true,
    settings: false
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SAVED_QUERIES = [
    {
      id: "s1",
      prompt: "Find all employees who make more than 60000 and work in Sales",
      label: "High Earners in Sales"
    },
    {
      id: "s2",
      prompt: "Calculate average employee salaries grouped by department name",
      label: "Avg Dept Salaries"
    },
    {
      id: "s3",
      prompt: "Get all customer records created in the last 180 days with no transactions",
      label: "Dormant Registrants"
    },
    {
      id: "s4",
      prompt: "Prune security logs that are older than 90 days from the index",
      label: "Audit Logs Cleanup"
    }
  ];

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

      {/* Accordions Container at the Bottom */}
      <div className="shrink-0 border-t-2 border-black divide-y-2 divide-black bg-[#171e19]">
        
        {/* Accordion: Saved Queries */}
        <div className="flex flex-col">
          <button
            onClick={() => toggleSection("saved")}
            className="w-full flex items-center justify-between p-3.5 bg-[#202722] hover:bg-[#2c372f] transition-colors text-xs font-extrabold uppercase tracking-wider text-white"
          >
            <span className="flex items-center gap-2">
              {openSections.saved ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Bookmark className="w-4 h-4 text-brutalYellow fill-current" />
              Quick Templates
            </span>
          </button>
          
          {openSections.saved && (
            <div className="p-3 bg-[#171e19] space-y-2 max-h-48 overflow-y-auto border-t border-black/20">
              {SAVED_QUERIES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onLoadHistoryItem({ prompt: item.prompt, sql_query: "" })}
                  className="w-full text-left p-2 bg-white text-black border-2 border-black hover:translate-x-0.5 hover:translate-y-0.5 shadow-brutal hover:shadow-brutal-sm transition-all flex flex-col space-y-0.5"
                >
                  <span className="text-[10px] font-extrabold text-black flex items-center gap-1">
                    <Bookmark className="w-2.5 h-2.5 fill-current text-brutalYellow" />
                    {item.label}
                  </span>
                  <p className="text-[9px] text-black/60 font-semibold line-clamp-1 leading-normal">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accordion: Settings */}
        <div className="flex flex-col">
          <button
            onClick={() => toggleSection("settings")}
            className="w-full flex items-center justify-between p-3.5 bg-[#202722] hover:bg-[#2c372f] transition-colors text-xs font-extrabold uppercase tracking-wider text-white"
          >
            <span className="flex items-center gap-2">
              {openSections.settings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Settings className="w-4 h-4 text-brutalYellow" />
              Settings
            </span>
          </button>
          
          {openSections.settings && (
            <div className="p-3 bg-[#171e19] border-t border-black/20">
              <div className="bg-white text-black border-2 border-black p-3 space-y-3.5 shadow-brutal">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-black/50 block">Auto-explain Output</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked id="cb-sidebar-explain" className="w-4 h-4 accent-black border-2 border-black" />
                    <label htmlFor="cb-sidebar-explain" className="text-[11px] font-bold">Enabled</label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-black/50 block">Query Limit (Rows)</label>
                  <input type="number" defaultValue={200} className="w-full border-2 border-black text-xs font-bold px-1.5 py-0.5 bg-white focus:outline-none focus:bg-brutalYellow" />
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </aside>
  );
}
