import React, { useState, useEffect } from "react";
import { Terminal, HelpCircle, ShieldAlert, Zap, Table, Eye, Copy, Download, RefreshCw, Play, Check, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function ResultPanel({
  result,
  onExecute,
  executeLoading,
  executeError,
  executeResults,
  onExportCSV,
  exportLoading,
  onRegenerate,
  // Optimization props
  optimizedSql,
  optimizedExplanation,
  optimizeLoading,
  // Execution plan props
  explainPlanResults,
  explainPlanLoading,
  explainPlanError,
  onFetchExplainPlan
}) {
  const [activeTab, setActiveTab] = useState("sql");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Switch to results tab if we get execution results
    if (executeResults) {
      setActiveTab("results");
    }
  }, [executeResults]);

  useEffect(() => {
    // If the active tab changes to execution_plan and we don't have results, fetch it
    if (activeTab === "execution_plan" && !explainPlanResults && onFetchExplainPlan) {
      onFetchExplainPlan();
    }
  }, [activeTab, explainPlanResults, onFetchExplainPlan]);

  if (!result) {
    return (
      <div className="w-full border-2 border-dashed border-black bg-white rounded-none p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-brutal min-h-[300px]">
        <div className="p-4 bg-brutalSage border-2 border-black shadow-brutal-sm">
          <Terminal className="w-8 h-8 text-black" />
        </div>
        <div className="max-w-sm font-satoshi text-black">
          <h3 className="text-sm font-extrabold uppercase">Awaiting prompt submission</h3>
          <p className="text-xs font-semibold text-black/60 mt-2 leading-relaxed">
            Enter a prompt in the Natural Language Prompt Editor to translate it to SQL code. You will then be able to explain, validate, optimize, and execute it here.
          </p>
        </div>
      </div>
    );
  }

  // Copy SQL to clipboard
  const handleCopySQL = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy SQL:", err);
    }
  };

  // Download SQL query file
  const handleDownloadSQL = (textToDownload) => {
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "query.sql";
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentSql = activeTab === "optimized" && optimizedSql ? optimizedSql : result.sql;

  return (
    <div className="w-full bg-white border-2 border-black shadow-brutal-lg font-satoshi text-black relative">
      {/* Top Banner: Tabs and Actions bar */}
      <div className="border-b-2 border-black flex flex-col xl:flex-row items-stretch justify-between bg-[#f5f5f5]">
        {/* Tab Buttons list */}
        <div className="flex flex-wrap border-b border-black xl:border-b-0 divide-x-2 divide-black">
          <button
            onClick={() => setActiveTab("sql")}
            className={`py-3.5 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeTab === "sql" ? "bg-brutalYellow text-black" : "bg-white text-black hover:bg-brutalSage"}`}
          >
            <Terminal className="w-3.5 h-3.5 shrink-0" />
            SQL Code
          </button>
          <button
            onClick={() => setActiveTab("explanation")}
            className={`py-3.5 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeTab === "explanation" ? "bg-brutalYellow text-black" : "bg-white text-black hover:bg-brutalSage"}`}
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            AI Explanation
          </button>
          <button
            onClick={() => setActiveTab("optimized")}
            className={`py-3.5 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeTab === "optimized" ? "bg-brutalYellow text-black" : "bg-white text-black hover:bg-brutalSage"}`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0 text-black" />
            Optimized SQL
          </button>
          <button
            onClick={() => setActiveTab("validation")}
            className={`py-3.5 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeTab === "validation" ? "bg-brutalYellow text-black" : "bg-white text-black hover:bg-brutalSage"}`}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Validation Report
          </button>
          <button
            onClick={() => setActiveTab("execution_plan")}
            className={`py-3.5 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeTab === "execution_plan" ? "bg-brutalYellow text-black" : "bg-white text-black hover:bg-brutalSage"}`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            Execution Plan
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`py-3.5 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${activeTab === "results" ? "bg-brutalYellow text-black" : "bg-white text-black hover:bg-brutalSage"}`}
          >
            <Table className="w-3.5 h-3.5 shrink-0" />
            Result Preview
          </button>
        </div>

        {/* Action button triggers */}
        <div className="flex items-center gap-2 p-2 shrink-0 select-none divide-x divide-black/10 xl:divide-x-0">
          <button
            onClick={() => handleCopySQL(currentSql)}
            className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase border-2 border-black bg-white py-1.5 px-3 hover:bg-brutalSage shadow-brutal-sm hover:translate-y-0.5 active:translate-y-1 transition-all"
            title="Copy SQL to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleDownloadSQL(currentSql)}
            className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase border-2 border-black bg-white py-1.5 px-3 hover:bg-brutalSage shadow-brutal-sm hover:translate-y-0.5 active:translate-y-1 transition-all"
            title="Download SQL File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={executeLoading}
            className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase border-2 border-black bg-white py-1.5 px-3 hover:bg-brutalSage shadow-brutal-sm hover:translate-y-0.5 active:translate-y-1 transition-all disabled:opacity-50"
            title="Re-run Prompt Generation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regen</span>
          </button>

          <button
            onClick={() => onExecute(currentSql)}
            disabled={executeLoading}
            className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase border-2 border-black bg-black text-white py-1.5 px-4.5 hover:bg-brutalYellow hover:text-black shadow-brutal-sm hover:translate-y-0.5 active:translate-y-1 transition-all disabled:opacity-50"
            title="Execute Query Statement"
          >
            {executeLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-white hover:text-black" />
            )}
            <span>Run Query</span>
          </button>
        </div>
      </div>

      {/* Main Tab View Canvas */}
      <div className="p-6">
        {/* TAB 1: SQL Code Panel */}
        {activeTab === "sql" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider">Active Query (Syntax Highlighted)</span>
              <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] px-2 py-0.5 border border-black/20">SQL Mode</span>
            </div>

            <div className="border-2 border-black font-mono text-sm leading-relaxed overflow-x-auto bg-[#fbfcfa]">
              <pre className="select-text whitespace-pre-wrap font-mono p-4">
                {result.sql.split("\n").map((line, idx) => {
                  const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "GROUP BY", "ORDER BY", "HAVING", "DELETE", "UPDATE", "SET", "AND", "OR", "ON", "DESC", "ASC", "LIMIT", "IN", "NOT IN", "EXISTS"];
                  return (
                    <div key={idx} className="table-row font-mono">
                      <span className="table-cell pr-5 text-black/40 text-[10px] text-right select-none w-6 font-mono border-r border-black/10 mr-4 font-bold">{idx + 1}</span>
                      <span className="table-cell pl-4 select-text font-mono text-black">
                        {line.split(/(\s+)/).map((word, wIdx) => {
                          const cleanWord = word.trim().toUpperCase();
                          if (keywords.includes(cleanWord)) {
                            return <span key={wIdx} className="text-black font-extrabold font-mono underline decoration-brutalYellow decoration-4">{word}</span>;
                          }
                          if (word.startsWith("'") || word.startsWith("`")) {
                            return <span key={wIdx} className="text-emerald-700 font-mono italic font-bold">{word}</span>;
                          }
                          if (!isNaN(word.trim()) && word.trim() !== "") {
                            return <span key={wIdx} className="text-red-600 font-mono font-bold">{word}</span>;
                          }
                          return <span key={wIdx} className="font-mono">{word}</span>;
                        })}
                      </span>
                    </div>
                  );
                })}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: AI Explanation Panel */}
        {activeTab === "explanation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider">Step-by-Step Logic Explanation</span>
              <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] px-2 py-0.5 border border-black/20">AI Summary</span>
            </div>

            <div className="space-y-3.5">
              {result.explanation && result.explanation.length > 0 ? (
                result.explanation.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-[#fbfcfa] border-2 border-black p-4 shadow-brutal-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-black border border-black flex items-center justify-center font-mono text-xs text-white font-extrabold">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-semibold leading-relaxed text-black/95 pt-0.5">
                      {step.split(/(`[^`]+`)/g).map((part, pIdx) => {
                        if (part.startsWith("`") && part.endsWith("`")) {
                          return (
                            <code key={pIdx} className="bg-black/5 border border-black/10 text-black py-0.2 px-1.5 rounded-none font-mono text-[11px] font-bold mx-0.5">
                              {part.slice(1, -1)}
                            </code>
                          );
                        }
                        return part;
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs font-semibold text-black/60 italic">
                  No explanation loaded. Click 'Explain Query' in Prompt Workspace.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Optimized SQL Panel */}
        {activeTab === "optimized" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider">Performance-Optimized Rewrite</span>
              <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] px-2 py-0.5 border border-black/20">AI Optimizer</span>
            </div>

            {optimizeLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#fbfcfa] border-2 border-black">
                <RefreshCw className="w-8 h-8 text-black animate-spin" />
                <p className="text-xs font-bold">Generating query optimization model details...</p>
              </div>
            ) : optimizedSql ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Optimized Code Output */}
                <div className="space-y-3">
                  <span className="text-xs font-bold block pl-0.5">Optimized SQL Query:</span>
                  <div className="border-2 border-black font-mono text-xs leading-relaxed overflow-x-auto bg-[#fbfcfa] p-4">
                    <pre className="select-text whitespace-pre-wrap font-mono text-black">
                      {optimizedSql}
                    </pre>
                  </div>
                </div>

                {/* Optimization reasoning */}
                <div className="space-y-3">
                  <span className="text-xs font-bold block pl-0.5">Optimization Explanation:</span>
                  <div className="border-2 border-black bg-brutalSage/20 p-4 space-y-2 text-xs font-semibold leading-relaxed">
                    <p className="whitespace-pre-wrap">{optimizedExplanation}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#fbfcfa] border-2 border-black p-8 text-center text-xs font-semibold space-y-3">
                <p className="text-black/60 italic">No optimization data generated yet.</p>
                <p className="text-[11px] text-black/55 max-w-md mx-auto">
                  Click the <strong className="font-extrabold text-black">Optimize Query</strong> button in the Prompt Workspace to analyze index efficiency, rewrite nested queries, and see optimized variations.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Validation Report Panel */}
        {activeTab === "validation" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider">Security & performance validation</span>
              <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] px-2 py-0.5 border border-black/20">Validation Service</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Risk metrics card */}
              <div className="border-2 border-black p-4 bg-white shadow-brutal-sm flex flex-col justify-between">
                <span className="text-black/55 uppercase font-extrabold text-[9px] tracking-wider">Overall Risk Profile</span>
                <span className={`text-xl font-black mt-2 inline-block px-3 py-1 border border-black text-center ${result.impact.riskLevel === 'HIGH' ? 'bg-red-500 text-white animate-pulse' : result.impact.riskLevel === 'MEDIUM' ? 'bg-amber-400 text-black' : 'bg-green-400 text-black'}`}>
                  {result.impact.riskLevel}
                </span>
              </div>

              {/* Rows affected metrics card */}
              <div className="border-2 border-black p-4 bg-white shadow-brutal-sm">
                <span className="text-black/55 uppercase font-extrabold text-[9px] tracking-wider">Estimated Affected Rows</span>
                <span className="text-2xl font-black font-mono mt-2 block text-black">
                  {result.impact.rowsAffected.toLocaleString()}
                </span>
              </div>

              {/* Rows returned metrics card */}
              <div className="border-2 border-black p-4 bg-white shadow-brutal-sm">
                <span className="text-black/55 uppercase font-extrabold text-[9px] tracking-wider">Est. Rows Returned</span>
                <span className="text-2xl font-black font-mono mt-2 block text-black">
                  {result.impact.rowsReturned.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Accessed tables */}
            <div className="border-2 border-black p-4 bg-[#fbfcfa]">
              <h4 className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider mb-2.5">Accessed Tables In Query</h4>
              <div className="flex flex-wrap gap-2">
                {result.impact.tables && result.impact.tables.length > 0 ? (
                  result.impact.tables.map((table, tIdx) => (
                    <span key={tIdx} className="text-xs font-mono font-bold bg-white border-2 border-black px-2.5 py-1 shadow-brutal-sm">
                      {table}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-black/55 italic">None detected</span>
                )}
              </div>
            </div>

            {/* Performance Advisory Warnings */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider pl-0.5">Performance Advisories</h4>
              <div className="bg-red-50 border-2 border-black p-4 space-y-2.5 shadow-brutal">
                {result.impact.warnings && result.impact.warnings.length > 0 ? (
                  result.impact.warnings.map((warn, wIdx) => (
                    <div key={wIdx} className="flex gap-2 items-start text-xs font-semibold leading-relaxed text-red-950">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p>{warn}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-2 items-center text-xs font-semibold text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <p>No query structure warnings detected. Safe to run.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Execution Plan Panel */}
        {activeTab === "execution_plan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider">MySQL EXPLAIN Optimizer Plan</span>
              <span className="text-[10px] font-mono font-bold bg-[#f5f5f5] px-2 py-0.5 border border-black/20">DB Catalog Optimizer</span>
            </div>

            {explainPlanLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#fbfcfa] border-2 border-black">
                <RefreshCw className="w-8 h-8 text-black animate-spin" />
                <p className="text-xs font-bold">Querying EXPLAIN schema plan from active database connection...</p>
              </div>
            ) : explainPlanError ? (
              <div className="p-4.5 bg-red-50 border-2 border-black text-red-900 text-xs font-semibold shadow-inner space-y-1">
                <p className="font-extrabold uppercase">Explain Statement Failed</p>
                <p>{explainPlanError}</p>
              </div>
            ) : explainPlanResults && Array.isArray(explainPlanResults) && explainPlanResults.length > 0 ? (
              <div className="overflow-x-auto border-2 border-black shadow-brutal bg-[#fbfcfa]">
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead>
                    <tr className="bg-black text-white border-b-2 border-black text-[9px] uppercase tracking-wider font-sans font-extrabold select-none">
                      {Object.keys(explainPlanResults[0]).map((key) => (
                        <th key={key} className="py-2.5 px-4 border-r border-white/20 last:border-r-0">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {explainPlanResults.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-black last:border-b-0 hover:bg-brutalYellow/10 transition-colors">
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="py-2 px-4 border-r border-black last:border-r-0 font-mono text-black font-bold">
                            {val === null ? <span className="text-black/30 font-sans italic">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#fbfcfa] border-2 border-black p-8 text-center text-xs font-semibold space-y-1">
                <p className="text-black/60 italic">No execution plan fetched.</p>
                <p className="text-[11px] text-black/55">Plan details will load when clicking the tab to request query planning metrics from MySQL.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Result Preview Panel */}
        {activeTab === "results" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-[10px] uppercase font-extrabold text-black/60 tracking-wider">Database Execution Output</span>
              {executeResults && Array.isArray(executeResults) && executeResults.length > 0 && (
                <button
                  onClick={onExportCSV}
                  disabled={exportLoading}
                  className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase border-2 border-black bg-white py-1 px-2.5 hover:bg-brutalSage shadow-brutal-sm hover:translate-y-0.5 transition-all"
                >
                  {exportLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {executeLoading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#fbfcfa] border-2 border-black">
                <RefreshCw className="w-8 h-8 text-black animate-spin" />
                <p className="text-xs font-bold">Executing SQL statement against active instance...</p>
              </div>
            )}

            {executeError && (
              <div className="p-4.5 bg-red-50 border-2 border-black text-red-950 text-xs font-semibold shadow-inner space-y-1">
                <div className="flex items-center gap-1 text-red-800 font-extrabold uppercase">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>Execution Failed</span>
                </div>
                <p className="font-mono mt-1 text-[11px] leading-relaxed">{executeError}</p>
              </div>
            )}

            {executeResults && !executeLoading && !executeError && (
              <>
                {Array.isArray(executeResults) ? (
                  executeResults.length === 0 ? (
                    <div className="bg-emerald-50 border-2 border-black p-6 text-center text-xs font-bold text-emerald-900 shadow-brutal-sm">
                      Query executed successfully. 0 rows returned.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border-2 border-black shadow-brutal bg-[#fbfcfa]">
                      <table className="w-full text-left border-collapse text-xs font-mono text-black">
                        <thead>
                          <tr className="bg-black text-white border-b-2 border-black text-[9px] uppercase tracking-wider font-sans font-extrabold select-none">
                            {Object.keys(executeResults[0]).map((key) => (
                              <th key={key} className="py-2.5 px-4 border-r border-white/20 last:border-r-0">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {executeResults.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-black last:border-b-0 hover:bg-brutalYellow/10 transition-colors">
                              {Object.values(row).map((val, cIdx) => (
                                <td key={cIdx} className="py-2 px-4 border-r border-black last:border-r-0 font-mono font-bold text-black">
                                  {val === null || val === undefined ? (
                                    <span className="text-black/30 font-sans italic">NULL</span>
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
                  <div className="bg-emerald-50 border-2 border-black p-5 text-xs font-semibold space-y-2.5 shadow-brutal">
                    <div className="flex items-center gap-2 text-emerald-950 font-extrabold uppercase">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                      <span>Query Executed Successfully</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-black/10 pt-3 text-[11px] text-black">
                      <div>
                        <span className="text-black/50 block text-[9px] uppercase tracking-wider">Affected Rows</span>
                        <span className="font-mono font-bold text-black text-sm block mt-0.5">{executeResults.affectedRows ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-black/50 block text-[9px] uppercase tracking-wider">Changed Rows</span>
                        <span className="font-mono font-bold text-black text-sm block mt-0.5">{executeResults.changedRows ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-black/50 block text-[9px] uppercase tracking-wider">Warning Count</span>
                        <span className="font-mono font-bold text-black text-sm block mt-0.5">{executeResults.warningStatus ?? 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!executeResults && !executeLoading && !executeError && (
              <div className="bg-[#fbfcfa] border-2 border-black p-8 text-center text-xs font-semibold">
                <p className="text-black/60 italic">No output cached.</p>
                <p className="text-[11px] text-black/55 mt-1">
                  Click the <strong className="font-extrabold text-black">Run Query</strong> action button above to execute this SQL query against MySQL.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
