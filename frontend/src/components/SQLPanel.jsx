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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-950/15">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <Terminal className="w-4 h-4 text-slate-350" />
          </div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">SQL Code Output</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-750 py-2 px-3.5 rounded-xl transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-450" />
                <span className="text-emerald-450">Copied!</span>
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
            className="flex items-center space-x-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 bg-indigo-950/45 hover:bg-indigo-900/40 border border-indigo-900/60 py-2 px-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {executeLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-indigo-450 fill-current" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-950 font-mono text-sm leading-relaxed overflow-x-auto">
        <pre className="text-slate-200 select-all whitespace-pre-wrap font-mono">
          {sql.split("\n").map((line, idx) => {
            const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "GROUP BY", "ORDER BY", "HAVING", "DELETE", "UPDATE", "SET", "AND", "ON", "DESC", "LIMIT"];
            
            return (
              <div key={idx} className="table-row font-mono">
                <span className="table-cell pr-5 text-slate-650 text-[11px] text-right select-none w-6 font-mono">{idx + 1}</span>
                <span className="table-cell select-text font-mono">
                  {line.split(/(\s+)/).map((word, wIdx) => {
                    const cleanWord = word.trim().toUpperCase();
                    if (keywords.includes(cleanWord)) {
                      return <span key={wIdx} className="text-indigo-400 font-extrabold font-mono">{word}</span>;
                    }
                    if (word.startsWith("'") || word.startsWith("`")) {
                      return <span key={wIdx} className="text-emerald-450 font-mono">{word}</span>;
                    }
                    if (!isNaN(word.trim()) && word.trim() !== "") {
                      return <span key={wIdx} className="text-amber-500 font-mono">{word}</span>;
                    }
                    return <span key={wIdx} className="font-mono text-slate-350">{word}</span>;
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
