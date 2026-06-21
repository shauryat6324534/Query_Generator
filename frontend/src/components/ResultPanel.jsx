import React, { useState, useEffect } from "react";
import { 
  Copy, 
  Check, 
  Terminal, 
  HelpCircle, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  TrendingUp, 
  AlertTriangle,
  Play,
  Download,
  Table,
  CheckCircle,
  Loader2
} from "lucide-react";
import { executeQuery, exportCSV } from "../services/api.js";

/**
 * @param {object} props
 * @param {object} [props.result]
 * @param {string} props.result.sql
 * @param {string[]} props.result.explanation
 * @param {object} props.result.impact
 * @param {string} props.result.impact.riskLevel - 'LOW' | 'MEDIUM' | 'HIGH'
 * @param {number} props.result.impact.rowsAffected
 * @param {number} props.result.impact.rowsReturned
 * @param {string[]} props.result.impact.tables
 * @param {string[]} props.result.impact.warnings
 */
export default function ResultPanel({ result }) {
  const [copied, setCopied] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState(null);
  const [executeResults, setExecuteResults] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Reset execution states when the query result object changes
  useEffect(() => {
    setExecuteResults(null);
    setExecuteError(null);
  }, [result]);

  if (!result) {
    return (
      <div className="w-full h-full border border-dashed border-slate-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/10 min-h-[300px]">
        <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-slate-500">
          <Terminal className="w-8 h-8" />
        </div>
        <div className="max-w-sm">
          <h3 className="text-sm font-semibold text-slate-300">Awaiting your prompt</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose a quick template above or write custom instructions to generate SQL queries, logic summaries, and safety analysis.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleExecute = async () => {
    if (executeLoading) return;
    setExecuteLoading(true);
    setExecuteError(null);
    try {
      const data = await executeQuery(result.sql);
      setExecuteResults(data);
    } catch (err) {
      setExecuteError(err.message || "Failed to execute query.");
    } finally {
      setExecuteLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (exportLoading || !executeResults) return;
    setExportLoading(true);
    try {
      const blob = await exportCSV(executeResults);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "query_results.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export error:", err);
      alert(err.message || "Failed to export query results.");
    } finally {
      setExportLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          text: "text-rose-400 border-rose-500/30 bg-rose-500/10",
          badge: "bg-rose-600 text-white"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          text: "text-amber-400 border-amber-500/30 bg-amber-500/10",
          badge: "bg-amber-600 text-white"
        };
      case "LOW":
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          text: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
          badge: "bg-emerald-600 text-white"
        };
    }
  };

  const riskStyle = getRiskColor(result.impact.riskLevel);

  return (
    <div className="w-full space-y-6">
      
      {/* CARD 1: SQL Output */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-500/10 rounded-md">
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Generated SQL Statement</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-1.5 px-3 rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>

            <button
              onClick={handleExecute}
              disabled={executeLoading}
              className="flex items-center space-x-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40 hover:border-indigo-700/60 py-1.5 px-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {executeLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />
                  <span>Execute Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-950/80 font-mono text-sm leading-relaxed overflow-x-auto">
          <pre className="text-indigo-200 select-all whitespace-pre-wrap font-mono">
            {result.sql.split("\n").map((line, idx) => {
              // Simple highlights for key keywords for a premium aesthetic
              const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "GROUP BY", "ORDER BY", "HAVING", "DELETE", "UPDATE", "SET", "AND", "ON", "DESC"];
              let formattedLine = line;
              
              return (
                <div key={idx} className="table-row">
                  <span className="table-cell pr-4 text-slate-600 text-xs text-right select-none w-6">{idx + 1}</span>
                  <span className="table-cell select-text">
                    {line.split(/(\s+)/).map((word, wIdx) => {
                      const cleanWord = word.trim().toUpperCase();
                      if (keywords.includes(cleanWord)) {
                        return <span key={wIdx} className="text-indigo-400 font-semibold">{word}</span>;
                      }
                      if (word.startsWith("'") || word.startsWith("`")) {
                        return <span key={wIdx} className="text-emerald-400">{word}</span>;
                      }
                      if (!isNaN(word.trim()) && word.trim() !== "") {
                        return <span key={wIdx} className="text-amber-400">{word}</span>;
                      }
                      return <span key={wIdx}>{word}</span>;
                    })}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* Grid: Explanation & Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 2: Explanation */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-1.5 bg-indigo-500/10 rounded-md">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Query Explanation</h3>
          </div>

          <div className="flex-grow space-y-3.5 text-xs text-slate-300">
            {result.explanation.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-indigo-400">
                  {idx + 1}
                </span>
                <p>
                  {/* Parse and highlight keywords in explanation */}
                  {step.split(/(`[^`]+`)/g).map((part, pIdx) => {
                    if (part.startsWith("`") && part.endsWith("`")) {
                      return (
                        <code key={pIdx} className="bg-slate-950/80 border border-slate-800 text-indigo-300 py-0.5 px-1.5 rounded font-mono text-[11px] mx-0.5">
                          {part.slice(1, -1)}
                        </code>
                      );
                    }
                    return part;
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: Impact Card */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-indigo-500/10 rounded-md">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Impact & Safety Analysis</h3>
            </div>
            
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${riskStyle.text}`}>
              {result.impact.riskLevel} Risk
            </span>
          </div>

          {/* Metrics list */}
          <div className="grid grid-cols-2 gap-3.5 bg-slate-950/60 p-4 border border-slate-900 rounded-xl">
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Rows Affected</p>
              <p className="text-sm font-bold font-mono text-slate-200">
                {result.impact.rowsAffected.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Est. Rows Returned</p>
              <p className="text-sm font-bold font-mono text-slate-200">
                {result.impact.rowsReturned.toLocaleString()}
              </p>
            </div>

            <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-900">
              <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Accessed Tables</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.impact.tables.map((table, tIdx) => (
                  <span key={tIdx} className="text-[10px] font-mono font-medium px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">
                    {table}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Warnings Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Performance Advisory</span>
            </h4>
            <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-2 ${riskStyle.bg}`}>
              {result.impact.warnings.map((warn, wIdx) => (
                <div key={wIdx} className="flex gap-2 items-start">
                  <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-400" />
                  <p className="text-slate-300 text-[11px]">{warn}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CARD 4: Query Execution Results */}
      {(executeResults || executeError || executeLoading) && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-indigo-500/10 rounded-md">
                <Table className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Query Execution Results</h3>
            </div>

            {executeResults && Array.isArray(executeResults) && executeResults.length > 0 && (
              <button
                onClick={handleExportCSV}
                disabled={exportLoading}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-1.5 px-3 rounded-lg transition-all disabled:opacity-50"
              >
                {exportLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Export CSV</span>
              </button>
            )}
          </div>

          <div className="p-6">
            {executeLoading && (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-xs text-slate-400">Running query against database...</p>
              </div>
            )}

            {executeError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Execution Failed</p>
                  <p className="text-[11px] text-rose-300/90 leading-relaxed">{executeError}</p>
                </div>
              </div>
            )}

            {executeResults && !executeLoading && !executeError && (
              <>
                {Array.isArray(executeResults) ? (
                  executeResults.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      Query executed successfully. No rows returned.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                            {Object.keys(executeResults[0]).map((key) => (
                              <th key={key} className="py-3 px-4 font-semibold select-none">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {executeResults.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-slate-900/60 py-2.5 px-4 text-slate-300 hover:bg-slate-900/30 transition-colors"
                            >
                              {Object.values(row).map((val, cIdx) => (
                                <td key={cIdx} className="py-2.5 px-4 font-mono">
                                  {val === null || val === undefined ? (
                                    <span className="text-slate-600 font-sans italic">NULL</span>
                                  ) : typeof val === "object" ? (
                                    JSON.stringify(val)
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">Query Executed Successfully</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Affected Rows</span>
                        <span className="font-mono font-bold text-slate-200">{executeResults.affectedRows ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Changed Rows</span>
                        <span className="font-mono font-bold text-slate-200">{executeResults.changedRows ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Warning Status</span>
                        <span className="font-mono font-bold text-slate-200">{executeResults.warningStatus ?? 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
