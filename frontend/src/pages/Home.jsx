import React, { useState, useEffect } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import QueryInputCard from "../components/QueryInputCard";
import ResultPanel from "../components/ResultPanel";
import { generateQuery, explainQuery, analyzeImpact, getHistory, checkBackendHealth, executeQuery, exportCSV } from "../services/api";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Health and System State
  const [backendOnline, setBackendOnline] = useState(false);

  // History states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Execution states
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState(null);
  const [executeResults, setExecuteResults] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchHistoryLogs = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history logs:", err);
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

  // Reset execution states when the query result changes
  useEffect(() => {
    setExecuteResults(null);
    setExecuteError(null);
  }, [result]);

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

      // Refresh history list
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

  const handleExecute = async () => {
    if (!result?.sql || executeLoading) return;
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

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased overflow-hidden">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        history={history}
        historyLoading={historyLoading}
        historyError={historyError}
        backendOnline={backendOnline}
        onLoadHistoryItem={handleLoadFromHistory}
      />

      {/* 2. Main Content Canvas Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar backendOnline={backendOnline} />

        {/* Scrollable Workspace */}
        <main className="flex-grow overflow-y-auto p-10 space-y-10 bg-slate-50/50">
          {/* Welcome Banner Card */}
          <div className="p-8 rounded-3xl border border-[#E5E7EB] bg-white shadow-md shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 fill-current" />
                <span>AI-Powered SQL Workspace Sandbox</span>
              </h2>
              <p className="text-sm text-slate-500 max-w-2xl font-semibold leading-relaxed">
                Type natural language prompts to translate, explain, and validate SQL queries against your database schemas. Use quick examples or logs from the sidebar query records index.
              </p>
            </div>
            
            {/* Context Stats */}
            <div className="flex gap-4 self-start md:self-auto border-t md:border-t-0 md:border-l border-[#E5E7EB] pt-3.5 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Connection</span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">MySQL Server</p>
              </div>
            </div>
          </div>

          {/* Main Grid: Inputs and Generated Views */}
          <div className="space-y-10 max-w-5xl">
            <QueryInputCard
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />

            {error && (
              <div className="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-3xl text-xs flex items-start gap-2.5 shadow-sm">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900 text-sm">Translation Failed</p>
                  <p className="text-[12px] text-rose-600 font-semibold mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 tracking-wide pl-1">Generated Output Workspace</h3>
              <ResultPanel
                result={result}
                onExecute={handleExecute}
                executeLoading={executeLoading}
                executeError={executeError}
                executeResults={executeResults}
                onExportCSV={handleExportCSV}
                exportLoading={exportLoading}
              />
            </div>
          </div>
        </main>

        {/* Workspace Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
            <p>© {new Date().getFullYear()} AI SQL Query Generator. Clean Dashboard Redesign.</p>
            <div className="flex space-x-4 text-[11px] text-slate-400">
              <span className="hover:text-slate-600 transition-colors">Sprint 14 Completed</span>
              <span>•</span>
              <span className="hover:text-slate-600 transition-colors">Tailwind CSS v3</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
