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
    <aside className="w-80 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 flex-shrink-0 z-50 shadow-xl shadow-slate-950/20">
      {/* Sidebar Header Brand */}
      <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3.5 bg-slate-950/30">
        <div className="p-2 bg-indigo-650 rounded-xl text-white shadow-lg shadow-indigo-500/20">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">Workspace</h2>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Control Panel</p>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="p-6 border-b border-slate-800/80 space-y-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">System Parameters</h3>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/50 rounded-xl text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              Engine
            </span>
            <span className="font-bold text-slate-200 text-[11px]">Gemini 3 Flash</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/50 rounded-xl text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              Database
            </span>
            <span className="font-bold text-slate-200 text-[11px]">MySQL Local</span>
          </div>
        </div>
      </div>

      {/* History Logger */}
      <div className="flex-grow flex flex-col min-h-0">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/20">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Query History</span>
          </h3>
          <span className="text-[10px] font-mono font-bold py-0.5 px-2.5 bg-slate-850 text-slate-400 rounded-full flex-shrink-0">
            {history.length} Logs
          </span>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {historyLoading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Fetching history...</p>
            </div>
          ) : historyError ? (
            <div className="text-center py-10 text-xs text-rose-400 font-medium">
              {historyError}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 text-xs text-slate-500 leading-relaxed font-medium">
              No saved query logs.<br />Generated items list here.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onLoadHistoryItem(item)}
                  className="w-full text-left p-4 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700/60 rounded-xl transition-all duration-200 group flex flex-col space-y-2.5 shadow-md shadow-black/10"
                >
                  <div className="flex justify-between items-start w-full gap-3">
                    <p className="text-sm font-semibold text-slate-200 line-clamp-2 leading-relaxed group-hover:text-indigo-400 transition-colors">
                      {item.prompt}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono font-medium flex-shrink-0 mt-0.5">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-400 line-clamp-1 truncate w-full overflow-hidden select-none bg-slate-950/80 p-2 rounded border border-slate-900/60">
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
