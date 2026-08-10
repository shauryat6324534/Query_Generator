import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Zap, Loader2 } from "lucide-react";
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
  optimizeQuery,
  connectDatabase,
  disconnectDatabase,
  loginUser,
  registerUser,
  logoutUser,
  checkAuthUser
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

  // Database Connection Session states
  const [sessionId, setSessionId] = useState(null);
  const [activeDatabase, setActiveDatabase] = useState("ai_sql_generator");
  const [isCustomDbActive, setIsCustomDbActive] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState(null);

  const handleConnectDb = async (config) => {
    setConnectLoading(true);
    setConnectError(null);
    addLog("info", `Attempting connection to custom database: "${config.database}"...`);
    try {
      const data = await connectDatabase(config);
      setSessionId(data.sessionId);
      setActiveDatabase(data.database);
      setIsCustomDbActive(true);
      addLog("success", `Successfully connected to custom database: "${data.database}"`);
      
      // Instantly load schema of the newly connected database
      setSchemaLoading(true);
      setSchemaError(null);
      try {
        const schemaData = await getSchema(data.sessionId);
        if (schemaData && schemaData.length > 0) {
          setSchema(schemaData);
          addLog("info", `Fetched database schema catalog for "${data.database}". Detected ${schemaData.length} tables.`);
        } else {
          setSchema(FALLBACK_SCHEMA);
          addLog("warning", `Schema catalog for "${data.database}" returned 0 tables.`);
        }
      } catch (schemaErr) {
        console.error("Failed to load schema details on connection switch:", schemaErr);
        setSchema(FALLBACK_SCHEMA);
        setSchemaError(`Failed to fetch schema details for ${data.database}`);
      } finally {
        setSchemaLoading(false);
      }

      // Re-fetch log history to load context history
      fetchHistoryLogs();

      return true;
    } catch (err) {
      setConnectError(err.message);
      addLog("error", `Connection to "${config.database}" failed: ${err.message}`);
      return false;
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectDb = async () => {
    if (!sessionId) return;
    addLog("info", "Disconnecting custom database and reverting to default connection...");
    try {
      await disconnectDatabase(sessionId);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
    setSessionId(null);
    setActiveDatabase("ai_sql_generator");
    setIsCustomDbActive(false);
    addLog("success", "Reverted to default database 'ai_sql_generator'.");
    
    // Refresh schema for default database
    setSchemaLoading(true);
    setSchemaError(null);
    try {
      const schemaData = await getSchema(null);
      if (schemaData && schemaData.length > 0) {
        setSchema(schemaData);
        addLog("info", `Restored schema catalog for default database. Detected ${schemaData.length} tables.`);
      } else {
        setSchema(FALLBACK_SCHEMA);
      }
    } catch (err) {
      setSchema(FALLBACK_SCHEMA);
    } finally {
      setSchemaLoading(false);
    }

    fetchHistoryLogs();
  };

  // App control states (cleaned)
  const activePromptRef = useRef("");
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authTab, setAuthTab] = useState("login"); // 'login' | 'register'
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

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
      const data = await getSchema(sessionId);
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

  const checkAuth = async () => {
    setIsAuthLoading(true);
    try {
      const data = await checkAuthUser();
      if (data && data.user) {
        setUser(data.user);
        addLog("success", `Active session restored for user: "${data.user.username}"`);
        fetchHistoryLogs();
        fetchSchemaDetails();
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword) return;
    setAuthError(null);
    try {
      const data = await loginUser(authUsername, authPassword);
      if (data && data.user) {
        setUser(data.user);
        addLog("success", `Logged in successfully as "${data.user.username}"`);
        setAuthUsername("");
        setAuthPassword("");
        fetchHistoryLogs();
        fetchSchemaDetails();
      }
    } catch (err) {
      setAuthError(err.message || "Failed to authenticate. Check credentials.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword) return;
    setAuthError(null);
    setAuthSuccessMsg("");
    try {
      const data = await registerUser(authUsername, authPassword);
      if (data && data.success) {
        setAuthSuccessMsg("Account created successfully! Please log in.");
        setAuthTab("login");
        setAuthPassword("");
      }
    } catch (err) {
      setAuthError(err.message || "Failed to register new user.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      addLog("info", `Logged out of user session "${user?.username}".`);
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setSessionId(null);
    setActiveDatabase("ai_sql_generator");
    setIsCustomDbActive(false);
    setHistory([]);
    setSchema([]);
    setResult(null);
    setOptimizedSql("");
    setOptimizedExplanation("");
    setExplainPlanResults(null);
    setExecuteResults(null);
  };

  useEffect(() => {
    verifyHealthStatus();
    checkAuth();
    addLog("info", "Initialized SQL Query Generator workspace.");
  }, []);

  // Reset execution states when the query result changes
  useEffect(() => {
    setExecuteResults(null);
    setExecuteError(null);
  }, [result]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const currentPrompt = prompt;
    activePromptRef.current = currentPrompt;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setOptimizedSql("");
    setOptimizedExplanation("");
    setExplainPlanResults(null);
    setExecuteResults(null);
    addLog("info", "Initiating SQL generation for request...");
    
    try {
      const genData = await generateQuery(prompt, sessionId);
      if (activePromptRef.current !== currentPrompt) {
        return; // Ignore stale response
      }
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
      if (activePromptRef.current !== currentPrompt) return;
      console.error("Error generating query response: ", err);
      setError("The AI service is currently unavailable. SQL generation cannot be completed at the moment. Please try again later or contact the administrator.");
      addLog("error", "SQL Generation failed: AI service is currently unavailable. Please try again later.");
    } finally {
      if (activePromptRef.current === currentPrompt) {
        setIsLoading(false);
      }
    }
  };

  const handleExplain = async () => {
    if (!result?.sql) return;
    setExplainLoading(true);
    addLog("info", "Requesting step-by-step logic explanation from AI engine...");
    try {
      const explainRes = await explainQuery(result.sql, sessionId);
      setResult((prev) => ({
        ...prev,
        explanation: explainRes.explanation
      }));
      addLog("success", "AI explanation generated successfully.");
    } catch (err) {
      console.error(err);
      addLog("error", "AI Explanation failed: AI service is currently unavailable. Please try again later.");
    } finally {
      setExplainLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!result?.sql) return;
    setValidateLoading(true);
    addLog("info", "Running static code safety validation and impact estimation...");
    try {
      const impactRes = await analyzeImpact(result.sql, sessionId);
      setResult((prev) => ({
        ...prev,
        impact: impactRes
      }));
      addLog("success", `Validation check complete. Risk assessment: ${impactRes.riskLevel}.`);
    } catch (err) {
      console.error(err);
      addLog("error", "Safety validation failed: AI service is currently unavailable. Please try again later.");
    } finally {
      setValidateLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!result?.sql) return;
    setOptimizeLoading(true);
    addLog("info", "Requesting query index optimization guidelines and SQL rewrite...");
    try {
      const optRes = await optimizeQuery(result.sql, sessionId);
      setOptimizedSql(optRes.optimizedSql);
      setOptimizedExplanation(optRes.explanation);
      addLog("success", "Optimization rewrite complete.");
    } catch (err) {
      console.error(err);
      addLog("error", "Optimization failed: AI service is currently unavailable. Please try again later.");
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
      const data = await executeQuery(`EXPLAIN ${result.sql}`, sessionId);
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
      const data = await executeQuery(targetSql, sessionId);
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

  // Helper selectors for diagnostics (cleaned mock diagnostics)

  // Filter history logs based on navbar search (cleaned)

  return (
    <div className="min-h-screen bg-white flex flex-col font-satoshi antialiased text-black overflow-hidden select-none">
      {/* 1. Fixed Header */}
      <Navbar
        backendOnline={backendOnline}
        dbConnected={backendOnline && !schemaError}
        activeDatabase={activeDatabase}
        isCustomDbActive={isCustomDbActive}
        onConnect={handleConnectDb}
        onDisconnect={handleDisconnectDb}
        connectLoading={connectLoading}
        connectError={connectError}
        setConnectError={setConnectError}
        authUser={user}
        onLogout={handleLogout}
      />

      {/* 0. Authentication Overlay */}
      {!user && !isAuthLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black p-6 md:p-8 shadow-brutal text-black font-satoshi">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-6">
              <div className="w-10 h-10 bg-brutalYellow border-2 border-black flex items-center justify-center shadow-brutal-sm">
                <Zap className="w-5 h-5 text-black fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">System Authentication</h2>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-black/60">AI Query Sandbox Login</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-100 border-2 border-black text-red-950 font-bold text-xs uppercase shadow-brutal-sm mb-4">
                {authError}
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-3 bg-emerald-100 border-2 border-black text-emerald-950 font-bold text-xs uppercase shadow-brutal-sm mb-4">
                {authSuccessMsg}
              </div>
            )}

            <form onSubmit={authTab === "login" ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider block">Username</label>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="enter username"
                  className="w-full bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none focus:bg-brutalYellow/10 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider block">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-black p-3 text-xs font-bold focus:outline-none focus:bg-brutalYellow/10 shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black text-white hover:bg-brutalYellow hover:text-black border-2 border-black font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm transition-all active:translate-y-0.5 mt-2"
              >
                {authTab === "login" ? "Login Session" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 border-t-2 border-black/10 pt-4 text-center">
              <button
                onClick={() => {
                  setAuthTab(authTab === "login" ? "register" : "login");
                  setAuthError(null);
                  setAuthSuccessMsg("");
                  setAuthPassword("");
                }}
                className="text-[11px] font-extrabold uppercase tracking-wider underline hover:text-brutalYellow-dark"
              >
                {authTab === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container beneath fixed header */}
      <div className="flex flex-grow h-[calc(100vh-80px)] mt-20 overflow-hidden">
        
        {/* 2. Left Sidebar */}
        <Sidebar
          history={history}
          historyLoading={historyLoading}
          historyError={historyError}
          onLoadHistoryItem={handleLoadFromHistory}
        />

        {/* 3. Main content pane divided into scrollable area & bottom diagnostics drawer */}
        <div className="flex-grow flex flex-col overflow-hidden bg-white border-r-2 border-black">
          
          {/* Top marquee status bar (removed for simplicity) */}

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
                    <p className="font-extrabold uppercase text-xs">AI Service Unavailable</p>
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
              <footer className="bg-white text-black border-t-2 border-black/10 py-6 px-4 mt-12 select-none flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
                <p className="text-black/60 font-medium">
                  © {new Date().getFullYear()} AI SQL Query Generator. Minimal Developer Edition.
                </p>
                <div className="flex gap-4 text-[11px] text-black/50">
                  <span>Natural Language → SQL</span>
                  <span>•</span>
                  <span>Vite + React</span>
                  <span>•</span>
                  <span>MySQL Database</span>
                </div>
              </footer>
            </main>

            {/* Collapsible bottom drawer locked at bottom of Middle Pane */}
            <BottomPanel
              executionLogs={executionLogs}
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
