import React, { useState, useEffect } from "react";
import { Database, Sparkles, History, Loader2, AlertTriangle } from "lucide-react";
import QueryInput from "../components/QueryInput";
import ResultPanel from "../components/ResultPanel";
import { generateQuery, explainQuery, analyzeImpact, getHistory, checkBackendHealth } from "../services/api";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // History States
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // System Health Status
  const [backendOnline, setBackendOnline] = useState(false);

  const fetchHistoryLogs = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistoryError("History logs temporarily unavailable.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const verifyHealthStatus = async () => {
    try {
      await checkBackendHealth();
      setBackendOnline(true);
    } catch (err) {
      console.error("Backend health check failed:", err);
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    verifyHealthStatus();
    fetchHistoryLogs();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      // 1. Call generate-query
      const genData = await generateQuery(prompt);
      const sql = genData.sql;

      // 2. Fetch explanation and safety analysis in parallel (with independent catches)
      let explanation = ["Logic details unavailable."];
      let impact = {
        riskLevel: "LOW",
        rowsAffected: 0,
        rowsReturned: 0,
        tables: [],
        warnings: ["Performance advisory details unavailable."]
      };

      try {
        const explainRes = await explainQuery(sql);
        explanation = explainRes.explanation;
      } catch (expErr) {
        console.error("Failed to explain query:", expErr);
        explanation = [`Query Explanation Error: ${expErr.message || "Failed to explain query"}`];
      }

      try {
        const impactRes = await analyzeImpact(sql);
        impact = impactRes;
      } catch (impErr) {
        console.error("Failed to analyze query impact:", impErr);
        impact.warnings = [`Safety Analysis Error: ${impErr.message || "Failed to analyze query impact"}`];
      }

      setResult({ sql, explanation, impact });

      // Refresh history log list
      fetchHistoryLogs();
    } catch (err) {
      console.error("Error generating query response: ", err);
      setError(err.message || "An unexpected error occurred during SQL generation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromHistory = async (item) => {
    setPrompt(item.prompt);
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const sql = item.sql_query;
      let explanation = ["Logic details unavailable."];
      let impact = {
        riskLevel: "LOW",
        rowsAffected: 0,
        rowsReturned: 0,
        tables: [],
        warnings: ["Performance advisory details unavailable."]
      };

      try {
        const explainRes = await explainQuery(sql);
        explanation = explainRes.explanation;
      } catch (expErr) {
        console.error("Failed to explain query:", expErr);
        explanation = [`Query Explanation Error: ${expErr.message || "Failed to explain query"}`];
      }

      try {
        const impactRes = await analyzeImpact(sql);
        impact = impactRes;
      } catch (impErr) {
        console.error("Failed to analyze query impact:", impErr);
        impact.warnings = [`Safety Analysis Error: ${impErr.message || "Failed to analyze query impact"}`];
      }

      setResult({ sql, explanation, impact });
    } catch (err) {
      setError(err.message || "Failed to reload query detail parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-950 flex flex-col justify-between overflow-x-hidden">
      {/* Dynamic atmospheric radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none" />

      {/* Main Header bar */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
              <Database className="w-5.5 h-5.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AI SQL Query Generator
                <span className="text-[10px] font-semibold py-0.5 px-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                  v1.0.0 (API Integrated)
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Generate, explain, and validate SQL queries instantly</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
              backendOnline 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              {backendOnline ? "System Online" : "System Offline"}
            </span>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full space-y-8">
        
        {/* Banner Section */}
        <div className="p-6 rounded-2xl border border-indigo-500/10 bg-gradient-to-r from-indigo-950/30 to-purple-950/20 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-md font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Interactive SQL Generator Interface</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Type natural language questions in the text box below. Our engine generates SQL code, provides comprehensive breakdown steps, and runs query checks safely against the database.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 self-start md:self-auto border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-6">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Database</span>
              <p className="text-xs font-bold text-slate-300 mt-0.5">MySQL Local Pool</p>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Translator</span>
              <p className="text-xs font-bold text-indigo-400 mt-0.5">Gemini 3 Flash</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid split: Input & Results (Left) and History (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main workspace section */}
          <div className="lg:col-span-2 space-y-8">
            <QueryInput
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Generation Failed</p>
                  <p className="text-[11px] text-rose-300/90 mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Generated Output Workspace</h3>
              <ResultPanel result={result} />
            </div>
          </div>

          {/* Sidebar Section: History Logger */}
          <div className="lg:col-span-1 space-y-6 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Query History</span>
              </h3>
              <span className="text-[10px] font-mono py-0.5 px-2 bg-slate-850 text-slate-400 rounded-full border border-slate-800 flex-shrink-0">
                {history.length} Logs
              </span>
            </div>

            {historyLoading && history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                <p className="text-[10px] text-slate-500">Loading history records...</p>
              </div>
            ) : historyError ? (
              <div className="text-center py-6 text-xs text-rose-400/90">
                {historyError}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No past translations saved yet. Generated queries will log here.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLoadFromHistory(item)}
                    className="w-full text-left p-3 bg-slate-950/60 hover:bg-slate-900/40 border border-slate-900/80 hover:border-indigo-500/20 rounded-xl transition-all duration-200 group flex flex-col space-y-2"
                  >
                    <div className="flex justify-between items-start w-full gap-2">
                      <p className="text-[11px] font-medium text-slate-300 line-clamp-2 leading-relaxed group-hover:text-indigo-400 transition-colors">
                        {item.prompt}
                      </p>
                      <span className="text-[9px] text-slate-500 font-mono flex-shrink-0 mt-0.5">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <pre className="text-[9px] font-mono text-slate-500 line-clamp-1 truncate w-full overflow-hidden select-none bg-slate-950/90 p-1.5 rounded border border-slate-900/50">
                      {item.sql_query}
                    </pre>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} AI SQL Query Generator. Connected to live API endpoints.</p>
          <div className="flex space-x-5">
            <span className="hover:text-slate-400 transition-colors">Sprint 13 Live</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Vite + React + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
