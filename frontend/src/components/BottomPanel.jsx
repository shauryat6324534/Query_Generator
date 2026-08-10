import React from "react";
import { Terminal, ChevronUp, ChevronDown, Activity } from "lucide-react";

export default function BottomPanel({
  executionLogs = [],
  isExpanded,
  setIsExpanded,
  activeTab,
  setActiveTab
}) {
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsExpanded(true); // Automatically expand when selecting a tab
  };

  return (
    <div 
      className={`w-full bg-[#fdfdfd] border-t-2 border-black transition-all duration-200 shrink-0 font-satoshi text-black z-30 select-none ${
        isExpanded ? "h-72" : "h-11"
      }`}
    >
      {/* Header Bar */}
      <div className="h-10 border-b border-black bg-[#f2f2f2] flex items-center justify-between px-4 select-none">
        {/* Left Toggle / Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleExpand}
            className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider hover:bg-brutalYellow border border-black/10 px-1.5 py-0.5 bg-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            Diagnostics
          </button>
          
          {/* Tab lists */}
          <div className="flex border-l border-black/10 pl-4 space-x-1">
            <button
              onClick={() => handleTabClick("logs")}
              className={`flex items-center gap-1 px-3 py-1 text-[10px] uppercase font-extrabold tracking-wider border-2 transition-all bg-brutalYellow border-black translate-y-0.5`}
            >
              <Terminal className="w-3 h-3 text-black" />
              Logs
            </button>
          </div>
        </div>

        {/* Right Status */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-extrabold uppercase opacity-70">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Local Engine Status: Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
          <span>Session Logs: {executionLogs.length}</span>
        </div>
      </div>

      {/* Expandable Panel Area */}
      {isExpanded && (
        <div className="p-4 h-[230px] overflow-y-auto bg-white">
          <div className="font-mono text-[11px] text-black/85 space-y-1 max-h-48 overflow-y-auto">
            {executionLogs.length === 0 ? (
              <p className="italic text-black/50">No operations executed yet in this session.</p>
            ) : (
              executionLogs.map((log, index) => (
                <div key={index} className="flex gap-2 py-0.5 border-b border-black/5 last:border-b-0 font-mono">
                  <span className="text-black/40 shrink-0 select-none font-mono">[{log.time}]</span>
                  <span className={`font-extrabold font-mono shrink-0 select-none ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-emerald-700' : 'text-blue-700'}`}>
                    [{log.type.toUpperCase()}]
                  </span>
                  <span className="font-mono select-text break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
