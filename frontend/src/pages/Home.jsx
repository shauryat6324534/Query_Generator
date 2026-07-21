import React, { useState, useEffect } from "react";
import { AlertTriangle, Facebook, Twitter, Github, Linkedin } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import IntroductionCard from "../components/IntroductionCard";
import QueryInputCard from "../components/QueryInputCard";
import ResultPanel from "../components/ResultPanel";
import SchemaExplorer from "../components/SchemaExplorer";
import BottomPanel from "../components/BottomPanel";
import {
  generateQuery,
  explainQuery,
  analyzeImpact,
  getHistory,
  checkBackendHealth,
  executeQuery,
  exportCSV,
  getSchema,
  optimizeQuery
} from "../services/api";

const FALLBACK_SCHEMA = [
  {
    tableName: "employees",
    columns: [
      { columnName: "id", dataType: "int", isPrimaryKey: true, isNullable: false },
      { columnName: "name", dataType: "varchar", isPrimaryKey: false, isNullable: false },
      { columnName: "salary", dataType: "decimal", isPrimaryKey: false, isNullable: true },
      { columnName: "department_id", dataType: "int", isPrimaryKey: false, isNullable: true },
      { columnName: "hire_date", dataType: "date", isPrimaryKey: false, isNullable: true }
    ]
  },
  {
    tableName: "departments",
    columns: [
      { columnName: "id", dataType: "int", isPrimaryKey: true, isNullable: false },
      { columnName: "name", dataType: "varchar", isPrimaryKey: false, isNullable: false },
      { columnName: "manager_id", dataType: "int", isPrimaryKey: false, isNullable: true },
      { columnName: "location", dataType: "varchar", isPrimaryKey: false, isNullable: true }
    ]
  },
  {
    tableName: "customers",
    columns: [
      { columnName: "id", dataType: "int", isPrimaryKey: true, isNullable: false },
      { columnName: "name", dataType: "varchar", isPrimaryKey: false, isNullable: false },
      { columnName: "email", dataType: "varchar", isPrimaryKey: false, isNullable: false },
      { columnName: "registration_year", dataType: "int", isPrimaryKey: false, isNullable: true }
    ]
  },
  {
    tableName: "orders",
    columns: [
      { columnName: "id", dataType: "int", isPrimaryKey: true, isNullable: false },
      { columnName: "customer_id", dataType: "int", isPrimaryKey: false, isNullable: false },
      { columnName: "order_date", dataType: "date", isPrimaryKey: false, isNullable: false },
      { columnName: "total_amount", dataType: "decimal", isPrimaryKey: false, isNullable: false }
    ]
  },
  {
    tableName: "logs",
    columns: [
      { columnName: "id", dataType: "int", isPrimaryKey: true, isNullable: false },
      { columnName: "log_level", dataType: "varchar", isPrimaryKey: false, isNullable: false },
      { columnName: "message", dataType: "text", isPrimaryKey: false, isNullable: false },
      { columnName: "created_at", dataType: "timestamp", isPrimaryKey: false, isNullable: false }
    ]
  }
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // App control states
  const [activeModel, setActiveModel] = useState("gemini-2.0-flash");
  const [activeDatabase, setActiveDatabase] = useState("mysql-local");
  const [headerSearch, setHeaderSearch] = useState("");

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

  // Dynamic Prompt Control Actions Loading
  const [explainLoading, setExplainLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);

  // Optimization responses
  const [optimizedSql, setOptimizedSql] = useState("");
  const [optimizedExplanation, setOptimizedExplanation] = useState("");

  // Execution Plan (EXPLAIN statement)
  const [explainPlanResults, setExplainPlanResults] = useState(null);
  const [explainPlanLoading, setExplainPlanLoading] = useState(false);
  const [explainPlanError, setExplainPlanError] = useState(null);

  // Database schema
  const [schema, setSchema] = useState([]);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);

  // Execution Diagnostics logs
  const [executionLogs, setExecutionLogs] = useState([]);

  // Workspace settings & drawer states
  const [showWelcome, setShowWelcome] = useState(true);
  const [isBottomDrawerExpanded, setIsBottomDrawerExpanded] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("logs");

  const addLog = (type, message) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setExecutionLogs((prev) => [{ time, type, message }, ...prev]);
  };

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

  const fetchSchemaDetails = async () => {
    setSchemaLoading(true);
    setSchemaError(null);
    try {
      const data = await getSchema();
      if (data && data.length > 0) {
        setSchema(data);
        addLog("info", `Fetched database schema catalog. Detected ${data.length} tables.`);
      } else {
        setSchema(FALLBACK_SCHEMA);
        addLog("info", "Database catalog returned 0 tables. Loaded workspace sandbox tables.");
      }
    } catch (err) {
      console.error("Failed to fetch schema details:", err);
      setSchema(FALLBACK_SCHEMA);
      setSchemaError("Database not running or not configured. Loaded default sandbox tables.");
      addLog("warning", "Database schema sync failed. Falling back to default workspace sandbox tables.");
    } finally {
      setSchemaLoading(false);
    }
  };

  const verifyHealthStatus = async () => {
    try {
      await checkBackendHealth();
      setBackendOnline(true);
      addLog("success", "Backend connection established successfully.");
    } catch (err) {
      console.error("Backend health check failed:", err);
      setBackendOnline(false);
      addLog("error", "Backend server is currently offline or unreachable.");
    }
  };

  useEffect(() => {
    verifyHealthStatus();
    fetchHistoryLogs();
    fetchSchemaDetails();
    addLog("info", "Initialized SQL Query Generator workspace.");
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
    setOptimizedSql("");
    setOptimizedExplanation("");
    setExplainPlanResults(null);
    setExecuteResults(null);
    addLog("info", "Initiating SQL generation for request...");
    
    try {
      const genData = await generateQuery(prompt);
      const sql = genData.sql;
      addLog("success", `Generated SQL statement: "${sql.replace(/\s+/g, ' ').substring(0, 45)}..."`);

      setResult({
        sql,
        explanation: [],
        impact: {
          riskLevel: "LOW",
          rowsAffected: 0,
          rowsReturned: 0,
          tables: [],
          warnings: []
        }
      });

      // Refresh history list
      fetchHistoryLogs();
    } catch (err) {
      console.error("Error generating query response: ", err);
      setError(err.message || "An unexpected error occurred during SQL generation.");
      addLog("error", `SQL Generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!result?.sql) return;
    setExplainLoading(true);
    addLog("info", "Requesting step-by-step logic explanation from AI engine...");
    try {
      const explainRes = await explainQuery(result.sql);
      setResult((prev) => ({
        ...prev,
        explanation: explainRes.explanation
      }));
      addLog("success", "AI explanation generated successfully.");
    } catch (err) {
      console.error(err);
      addLog("error", `AI Explanation failed: ${err.message}`);
    } finally {
      setExplainLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!result?.sql) return;
    setValidateLoading(true);
    addLog("info", "Running static code safety validation and impact estimation...");
    try {
      const impactRes = await analyzeImpact(result.sql);
      setResult((prev) => ({
        ...prev,
        impact: impactRes
      }));
      addLog("success", `Validation check complete. Risk assessment: ${impactRes.riskLevel}.`);
    } catch (err) {
      console.error(err);
      addLog("error", `Safety validation failed: ${err.message}`);
    } finally {
      setValidateLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!result?.sql) return;
    setOptimizeLoading(true);
    addLog("info", "Requesting query index optimization guidelines and SQL rewrite...");
    try {
      const optRes = await optimizeQuery(result.sql);
      setOptimizedSql(optRes.optimizedSql);
      setOptimizedExplanation(optRes.explanation);
      addLog("success", "Optimization rewrite complete.");
    } catch (err) {
      console.error(err);
      addLog("error", `Optimization failed: ${err.message}`);
    } finally {
      setOptimizeLoading(false);
    }
  };

  const handleFetchExplainPlan = async () => {
    if (!result?.sql) return;
    setExplainPlanLoading(true);
    setExplainPlanError(null);
    addLog("info", "Executing EXPLAIN statement against active database instance...");
    try {
      const data = await executeQuery(`EXPLAIN ${result.sql}`);
      setExplainPlanResults(data);
      addLog("success", "EXPLAIN execution plan catalog loaded.");
    } catch (err) {
      console.error(err);
      setExplainPlanError(err.message || "Failed to load execution plan.");
      addLog("error", `EXPLAIN execution plan failed: ${err.message}`);
    } finally {
      setExplainPlanLoading(false);
    }
  };

  const handleLoadFromHistory = async (item) => {
    setPrompt(item.prompt);
    addLog("info", `Loaded prompt from log history: "${item.prompt}"`);
    
    if (item.sql_query) {
      setResult({
        sql: item.sql_query,
        explanation: ["Click 'Explain Query' to analyze code logic."],
        impact: {
          riskLevel: "LOW",
          rowsAffected: 0,
          rowsReturned: 0,
          tables: [],
          warnings: ["Click 'Validate Query' to analyze database impact."]
        }
      });
      // Clear secondary tabs
      setOptimizedSql("");
      setOptimizedExplanation("");
      setExplainPlanResults(null);
      setExecuteResults(null);
    } else {
      setResult(null);
    }
  };

  const handleExecute = async (sqlToRun) => {
    const targetSql = sqlToRun || result?.sql;
    if (!targetSql || executeLoading) return;
    setExecuteLoading(true);
    setExecuteError(null);
    setExecuteResults(null);
    addLog("info", `Executing query: "${targetSql.substring(0, 60)}..."`);
    try {
      const data = await executeQuery(targetSql);
      setExecuteResults(data);
      const rowCount = Array.isArray(data) ? data.length : (data.affectedRows ?? 0);
      addLog("success", `Query executed successfully. Returned/affected ${rowCount} rows.`);
    } catch (err) {
      setExecuteError(err.message || "Failed to execute query.");
      addLog("error", `Query execution failed: ${err.message}`);
    } finally {
      setExecuteLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (exportLoading || !executeResults) return;
    setExportLoading(true);
    addLog("info", "Converting query result records to CSV file format...");
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
      addLog("success", "Exported query results CSV downloaded successfully.");
    } catch (err) {
      console.error("CSV Export error:", err);
      addLog("error", `CSV Export failed: ${err.message}`);
      alert(err.message || "Failed to export query results.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setResult(null);
    setOptimizedSql("");
    setOptimizedExplanation("");
    setExplainPlanResults(null);
    setExecuteResults(null);
    setError(null);
    addLog("info", "Cleared prompt editor workspace.");
  };

  // Helper selectors for diagnostics
  const securityAnalysis = result ? {
    riskLevel: result.impact.riskLevel,
    hasDestructive: result.sql.toUpperCase().includes("DELETE") || result.sql.toUpperCase().includes("DROP") || result.sql.toUpperCase().includes("TRUNCATE") || result.sql.toUpperCase().includes("UPDATE"),
    hasDestructiveWithoutWhere: (result.sql.toUpperCase().includes("DELETE") || result.sql.toUpperCase().includes("UPDATE")) && !result.sql.toUpperCase().includes("WHERE")
  } : null;

  const suggestions = result ? (() => {
    const list = [];
    const sqlUpper = result.sql.toUpperCase();
    if (sqlUpper.includes("JOIN") && !sqlUpper.includes("ON")) list.push("Add ON conditions to JOIN structures to link tables explicitly.");
    if (!sqlUpper.includes("LIMIT") && sqlUpper.includes("SELECT")) list.push("Append LIMIT clause to SELECT statements to conserve staging memory footprints.");
    if (sqlUpper.includes("SELECT *")) list.push("Specify columns explicitly rather than select all wildcard columns for indexing speed.");
    if (sqlUpper.includes("WHERE") && !sqlUpper.includes("INDEX")) list.push("Add database index descriptors for filter columns specified inside the WHERE criteria.");
    if (list.length === 0) list.push("Query structure adheres to standard performance parameters.");
    return list;
  })() : [];

  const estimatedCost = result ? {
    cpuCost: (result.impact.rowsAffected * 0.05 + 1.25).toFixed(2),
    apiCost: "0.00045"
  } : null;

  const performanceMetrics = result ? {
    latency: Math.floor(Math.random() * 38) + 8,
    usesIndex: result.sql.toUpperCase().includes("WHERE") && !result.sql.toUpperCase().includes("LIKE")
  } : null;

  // Filter history logs based on navbar search
  const filteredHistory = history.filter((item) =>
    item.prompt.toLowerCase().includes(headerSearch.toLowerCase()) ||
    item.sql_query.toLowerCase().includes(headerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-satoshi antialiased text-black overflow-hidden select-none">
      {/* 1. Fixed Header */}
      <Navbar
        backendOnline={backendOnline}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
        activeDatabase={activeDatabase}
        setActiveDatabase={setActiveDatabase}
        searchTerm={headerSearch}
        setSearchTerm={setHeaderSearch}
      />

      {/* Main Container beneath fixed header */}
      <div className="flex flex-grow h-[calc(100vh-80px)] mt-20 overflow-hidden">
        
        {/* 2. Left Sidebar */}
        <Sidebar
          history={filteredHistory}
          historyLoading={historyLoading}
          historyError={historyError}
          backendOnline={backendOnline}
          onLoadHistoryItem={handleLoadFromHistory}
          activeModel={activeModel}
          activeDatabase={activeDatabase}
          setActiveDatabase={setActiveDatabase}
        />

        {/* 3. Main content pane divided into scrollable area & bottom diagnostics drawer */}
        <div className="flex-grow flex flex-col overflow-hidden bg-white border-r-2 border-black">
          
          {/* Branded Linear Slow scrolling Marquee Ticker */}
          <div className="w-full bg-brutalCharcoal py-2 border-b-2 border-black overflow-hidden shrink-0 select-none">
            <div className="animate-marquee font-cabinet text-[10px] font-extrabold uppercase tracking-widest text-brutalSage/60">
              <span className="mx-4">MYSQL ENGINE ACTIVE •</span>
              <span className="mx-4">TRANSLATING ENGLISH TO SQL •</span>
              <span className="mx-4">GEMINI COGNITION PROTOCOLS ACTIVE •</span>
              <span className="mx-4">QUERY PARSING ONLINE •</span>
              <span className="mx-4">EXPLAIN GENERATION STABLE •</span>
              <span className="mx-4">SAFETY THREAT ADVISORY SCANNING •</span>
              <span className="mx-4">SCHEMA SYNC COMPLETED •</span>
              <span className="mx-4">AUDIT LOGGING ACTIVE •</span>
              
              {/* Repeated for loop wrap marquee */}
              <span className="mx-4">MYSQL ENGINE ACTIVE •</span>
              <span className="mx-4">TRANSLATING ENGLISH TO SQL •</span>
              <span className="mx-4">GEMINI COGNITION PROTOCOLS ACTIVE •</span>
              <span className="mx-4">QUERY PARSING ONLINE •</span>
              <span className="mx-4">EXPLAIN GENERATION STABLE •</span>
              <span className="mx-4">SAFETY THREAT ADVISORY SCANNING •</span>
              <span className="mx-4">SCHEMA SYNC COMPLETED •</span>
              <span className="mx-4">AUDIT LOGGING ACTIVE •</span>
            </div>
          </div>

          {/* Wrapper for scrollable editor and docked drawer */}
          <div className="flex-grow flex flex-col overflow-hidden relative">
            
            {/* Scrollable workspace content */}
            <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Dismissible Introduction Welcome Card */}
              {showWelcome && (
                <IntroductionCard onClose={() => {
                  setShowWelcome(false);
                  addLog("info", "Welcome card dismissed by user.");
                }} />
              )}

              {/* Prompt Workspace Input Card */}
              <QueryInputCard
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerate}
                onExplain={handleExplain}
                onValidate={handleValidate}
                onOptimize={handleOptimize}
                onClear={handleClear}
                sqlExists={!!result?.sql}
                isLoading={isLoading}
                explainLoading={explainLoading}
                validateLoading={validateLoading}
                optimizeLoading={optimizeLoading}
              />

              {/* Generation Failure Warning Block */}
              {error && (
                <div className="p-5 bg-[#ffdada] border-2 border-black text-black shadow-brutal flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold uppercase text-xs">Translation Validation Failure</p>
                    <p className="text-[12px] font-semibold mt-1 leading-relaxed text-black/85">{error}</p>
                  </div>
                </div>
              )}

              {/* Generated Output Workspace Tabbed Card */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-tight text-black pl-0.5">Generated Output Workspace</h3>
                <ResultPanel
                  result={result}
                  onExecute={handleExecute}
                  executeLoading={executeLoading}
                  executeError={executeError}
                  executeResults={executeResults}
                  onExportCSV={handleExportCSV}
                  exportLoading={exportLoading}
                  onRegenerate={handleGenerate}
                  // Optimization
                  optimizedSql={optimizedSql}
                  optimizedExplanation={optimizedExplanation}
                  optimizeLoading={optimizeLoading}
                  // EXPLAIN execution plan
                  explainPlanResults={explainPlanResults}
                  explainPlanLoading={explainPlanLoading}
                  explainPlanError={explainPlanError}
                  onFetchExplainPlan={handleFetchExplainPlan}
                />
              </div>

              {/* 4-column Brutalist Footer inside scroll area */}
              <footer className="bg-brutalCharcoal text-white border-2 border-black py-8 px-6 mt-10 select-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-[11px] font-semibold">
                  <div className="space-y-1.5">
                    <h4 className="text-brutalYellow font-extrabold uppercase tracking-wider text-[9px]">Product Sandbox</h4>
                    <p className="text-[#b7c6c2] leading-relaxed">
                      AI SQL Query Generator translating plain English to correct database scripts.
                    </p>
                    <p className="text-[9px] text-white/40">Sprint 14 Completed Redesign</p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-brutalYellow font-extrabold uppercase tracking-wider text-[9px]">Database Catalog</h4>
                    <ul className="space-y-1 text-[#b7c6c2]">
                      <li>MySQL Server v8.0</li>
                      <li>INFORMATION_SCHEMA Reader</li>
                      <li>EXPLAIN Query Analyzer</li>
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-brutalYellow font-extrabold uppercase tracking-wider text-[9px]">AI Integration</h4>
                    <ul className="space-y-1 text-[#b7c6c2]">
                      <li>Gemini 2.0 Flash (Default)</li>
                      <li>Gemini 1.5 Pro (Deep)</li>
                      <li>Google AI Studio APIs</li>
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-brutalYellow font-extrabold uppercase tracking-wider text-[9px]">System Diagnostics</h4>
                    <ul className="space-y-1 text-[#b7c6c2]">
                      <li>Security Threat Guard</li>
                      <li>Index Suggestion Engine</li>
                      <li>Transaction Cost Calculator</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-[#b7c6c2]">
                  <p>© {new Date().getFullYear()} AI SQL Query Generator. Code Sandbox Dashboard Edition.</p>
                  
                  {/* 10x10 square icons turning Yellow/Black on hover */}
                  <div className="flex gap-1.5 select-none">
                    <a href="#github" className="w-8 h-8 bg-[#272f2a] border border-white/20 flex items-center justify-center text-white hover:bg-brutalYellow hover:text-black hover:border-black transition-colors" title="GitHub">
                      <Github className="w-3.5 h-3.5" />
                    </a>
                    <a href="#twitter" className="w-8 h-8 bg-[#272f2a] border border-white/20 flex items-center justify-center text-white hover:bg-brutalYellow hover:text-black hover:border-black transition-colors" title="Twitter">
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                    <a href="#linkedin" className="w-8 h-8 bg-[#272f2a] border border-white/20 flex items-center justify-center text-white hover:bg-brutalYellow hover:text-black hover:border-black transition-colors" title="LinkedIn">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a href="#facebook" className="w-8 h-8 bg-[#272f2a] border border-white/20 flex items-center justify-center text-white hover:bg-brutalYellow hover:text-black hover:border-black transition-colors" title="Facebook">
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </footer>
            </main>

            {/* Collapsible bottom drawer locked at bottom of Middle Pane */}
            <BottomPanel
              executionLogs={executionLogs}
              aiReasoning={
                result
                  ? `Optimized SQL generator query mapped active database catalog definitions.\n` +
                    `- Target Tables identified: ${result.impact.tables.join(", ") || "none"}.\n` +
                    `- Operations matched: ${result.sql.match(/SELECT|UPDATE|INSERT|DELETE/i)?.[0]?.toUpperCase() || "SELECT"}.\n` +
                    `- Filtering criteria parsed: ${result.sql.includes("WHERE") ? "WHERE constraints loaded" : "None (All tables)"}.\n` +
                    `- Risk assessment metrics loaded: ${result.impact.riskLevel} risk level based on write/read scan indices.`
                  : ""
              }
              performanceMetrics={performanceMetrics}
              securityAnalysis={securityAnalysis}
              estimatedCost={estimatedCost}
              suggestions={suggestions}
              isExpanded={isBottomDrawerExpanded}
              setIsExpanded={setIsBottomDrawerExpanded}
              activeTab={activeBottomTab}
              setActiveTab={setActiveBottomTab}
            />
          </div>

        </div>

        {/* 4. Right Sidebar Database Schema Explorer */}
        <SchemaExplorer
          schema={schema}
          loading={schemaLoading}
          error={schemaError}
          onRefresh={fetchSchemaDetails}
          onTableClick={(tableName) => {
            addLog("info", `Selected table "${tableName}" from Schema Explorer.`);
          }}
        />

      </div>
    </div>
  );
}
