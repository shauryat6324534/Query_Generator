import React, { useState } from "react";
import { Terminal, Copy, Check, Play, Loader2 } from "lucide-react";

export default function SQLPanel({ sql, onExecute, executeLoading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-md shadow-slate-200/40">
      <div className="px-6 py-4 border-b border-[#E5E7EB] bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
            <Terminal className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">SQL Code Output</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-650 hover:text-slate-850 bg-white hover:bg-slate-50 border border-[#E5E7EB] py-2 px-3.5 rounded-xl transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExecute}
            disabled={executeLoading}
            className="flex items-center space-x-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 py-2 px-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {executeLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-indigo-500 fill-current" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50 font-mono text-sm leading-relaxed overflow-x-auto">
        <pre className="text-slate-800 select-all whitespace-pre-wrap font-mono">
          {sql.split("\n").map((line, idx) => {
            const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "GROUP BY", "ORDER BY", "HAVING", "DELETE", "UPDATE", "SET", "AND", "ON", "DESC", "LIMIT"];
            
            return (
              <div key={idx} className="table-row font-mono">
                <span className="table-cell pr-5 text-slate-400 text-[11px] text-right select-none w-6 font-mono">{idx + 1}</span>
                <span className="table-cell select-text font-mono">
                  {line.split(/(\s+)/).map((word, wIdx) => {
                    const cleanWord = word.trim().toUpperCase();
                    if (keywords.includes(cleanWord)) {
                      return <span key={wIdx} className="text-indigo-600 font-extrabold font-mono">{word}</span>;
                    }
                    if (word.startsWith("'") || word.startsWith("`")) {
                      return <span key={wIdx} className="text-emerald-600 font-mono">{word}</span>;
                    }
                    if (!isNaN(word.trim()) && word.trim() !== "") {
                      return <span key={wIdx} className="text-amber-600 font-mono">{word}</span>;
                    }
                    return <span key={wIdx} className="font-mono text-slate-700">{word}</span>;
                  })}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
