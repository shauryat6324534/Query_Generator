import React from "react";
import { History, Loader2, Database, Cpu } from "lucide-react";

export default function Sidebar({
  history,
  historyLoading,
  historyError,
  backendOnline,
  onLoadHistoryItem
}) {
  return (
    <aside className="w-80 bg-[#F6F7F9] text-[#111827] flex flex-col h-screen sticky top-0 flex-shrink-0 z-50 shadow-md border-r border-[#E5E7EB]">
      {/* Sidebar Header Brand */}
      <div className="p-6 border-b border-[#E5E7EB] flex items-center space-x-3.5 bg-white">
        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-[#111827] tracking-wider uppercase">Workspace</h2>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Control Panel</p>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="p-6 border-b border-[#E5E7EB] space-y-4">
        <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest pl-1">System Parameters</h3>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-xs shadow-sm">
            <span className="text-[#6B7280] font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#6B7280]" />
              Engine
            </span>
            <span className="font-bold text-[#111827] text-[11px]">Gemini 3 Flash</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-xs shadow-sm">
            <span className="text-[#6B7280] font-semibold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#6B7280]" />
              Database
            </span>
            <span className="font-bold text-[#111827] text-[11px]">MySQL Local</span>
          </div>
        </div>
      </div>

      {/* History Logger */}
      <div className="flex-grow flex flex-col min-h-0 bg-[#F6F7F9]">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB] bg-white">
          <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Query History</span>
          </h3>
          <span className="text-[10px] font-mono font-bold py-0.5 px-2.5 bg-[#F6F7F9] text-[#6B7280] border border-[#E5E7EB] rounded-full flex-shrink-0">
            {history.length} Logs
          </span>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {historyLoading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              <p className="text-xs text-[#6B7280] font-medium">Fetching history...</p>
            </div>
          ) : historyError ? (
            <div className="text-center py-10 text-xs text-rose-600 font-medium">
              {historyError}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 text-xs text-[#6B7280] leading-relaxed font-medium">
              No saved query logs.<br />Generated items list here.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onLoadHistoryItem(item)}
                  className="w-full text-left p-4 bg-[#FFFFFF] hover:bg-slate-50 border border-[#E5E7EB] hover:border-indigo-300 rounded-xl transition-all duration-200 group flex flex-col space-y-2.5 shadow-sm"
                >
                  <div className="flex justify-between items-start w-full gap-3">
                    <p className="text-sm font-semibold text-[#111827] line-clamp-2 leading-relaxed group-hover:text-indigo-600 transition-colors">
                      {item.prompt}
                    </p>
                    <span className="text-[10px] text-[#6B7280] font-mono font-medium flex-shrink-0 mt-0.5">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <pre className="text-[10px] font-mono text-[#6B7280] line-clamp-1 truncate w-full overflow-hidden select-none bg-[#F6F7F9] p-2 rounded border border-[#E5E7EB]">
                    {item.sql_query}
                  </pre>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
