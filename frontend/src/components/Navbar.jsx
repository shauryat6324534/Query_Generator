import React, { useState } from "react";
import { Zap, Layers, Database, X, Check, Loader2, AlertCircle } from "lucide-react";
import { testDatabase } from "../services/api";

export default function Navbar({
  backendOnline,
  dbConnected,
  activeDatabase = "ai_sql_generator",
  isCustomDbActive = false,
  onConnect,
  onDisconnect,
  connectLoading = false,
  connectError = null,
  setConnectError,
  authUser = null,
  onLogout
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("3306");
  const [user, setUser] = useState("root");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [testStatus, setTestStatus] = useState(null); // 'success' | 'error' | null
  const [testMessage, setTestMessage] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setTestStatus(null);
    setTestMessage("");
    if (setConnectError) setConnectError(null);
  };

  const handleTestConnection = async (e) => {
    e.preventDefault();
    if (!host || !user || !database) {
      setTestStatus("error");
      setTestMessage("Host, User, and Database are required to test connection.");
      return;
    }
    setTestLoading(true);
    setTestStatus(null);
    setTestMessage("");
    try {
      await testDatabase({ host, port, user, password, database });
      setTestStatus("success");
      setTestMessage("Connection test succeeded!");
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!host || !user || !database) {
      if (setConnectError) setConnectError("Host, User, and Database are required to connect.");
      return;
    }
    const success = await onConnect({ host, port, user, password, database });
    if (success) {
      setIsOpen(false);
      setPassword("");
    }
  };

  const handleDisconnect = async () => {
    await onDisconnect();
    setIsOpen(false);
    setDatabase("");
    setPassword("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-brutalYellow border-b-2 border-black flex items-center justify-between px-6 z-50 font-satoshi select-none">
      {/* Left Area: Logo & App Title */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-brutal-sm">
          <Zap className="w-5 h-5 text-brutalYellow fill-current" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-black uppercase tracking-tight flex items-center gap-1.5">
            AI SQL Query Generator
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-black text-brutalYellow border border-black rounded-none hidden md:inline">
              v1.0
            </span>
          </h1>
          <p className="text-[9px] font-bold text-black uppercase tracking-widest leading-none mt-0.5 opacity-70">
            Neo-Brutalist Query Sandbox
          </p>
        </div>
      </div>

      {/* Right Area: System Status Indicators & Connect Action */}
      <div className="flex items-center gap-3 relative">
        {/* Database Status Badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black text-[10px] font-extrabold tracking-wider uppercase bg-white shadow-brutal-sm ${
          dbConnected ? "text-black bg-emerald-50" : "text-red-700 bg-red-50"
        }`}>
          <Layers className="w-3.5 h-3.5" />
          <span>DB: {dbConnected ? `Online (${activeDatabase})` : "Offline"}</span>
        </span>

        {/* API Status Badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black text-[10px] font-extrabold tracking-wider uppercase bg-white shadow-brutal-sm ${
          backendOnline ? "text-black bg-emerald-50" : "text-red-700 bg-red-50"
        }`}>
          <Zap className="w-3.5 h-3.5" />
          <span>API: {backendOnline ? "Online" : "Offline"}</span>
        </span>

        {/* User Profile / Logout Action */}
        {authUser && (
          <button
            onClick={onLogout}
            className="py-1 px-3 bg-red-500 text-white border-2 border-black font-extrabold uppercase text-[10px] tracking-wider shadow-brutal-sm hover:bg-red-650 transition-all active:translate-y-0.5 flex items-center gap-1"
            title={`Log out of user session "${authUser.username}"`}
          >
            <span>Logout ({authUser.username})</span>
          </button>
        )}

        {/* Dynamic DB Connect Button */}
        <button
          onClick={toggleDropdown}
          className="py-1 px-3 bg-white text-black border-2 border-black font-extrabold uppercase text-[10px] tracking-wider shadow-brutal-sm hover:bg-brutalSage transition-all active:translate-y-0.5 flex items-center gap-1.5"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isCustomDbActive ? "Switch Database" : "Connect Custom DB"}</span>
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute top-12 right-0 w-80 bg-white border-2 border-black shadow-brutal p-5 text-black font-satoshi text-xs z-50">
            <div className="flex justify-between items-center pb-3 border-b-2 border-black mb-3">
              <span className="font-extrabold uppercase text-xs">Configure Connection</span>
              <button onClick={toggleDropdown} className="p-0.5 border border-black hover:bg-red-150">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form className="space-y-3.5">
              <div className="flex gap-2">
                <div className="flex-grow space-y-1">
                  <label className="font-extrabold text-[9px] uppercase tracking-wider text-black/60">Host</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full border-2 border-black px-2 py-1 bg-white focus:outline-none focus:bg-brutalYellow font-bold"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <label className="font-extrabold text-[9px] uppercase tracking-wider text-black/60">Port</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full border-2 border-black px-2 py-1 bg-white focus:outline-none focus:bg-brutalYellow font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-[9px] uppercase tracking-wider text-black/60">Username</label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full border-2 border-black px-2 py-1 bg-white focus:outline-none focus:bg-brutalYellow font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-[9px] uppercase tracking-wider text-black/60">Password</label>
                <input
                  type="password"
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black px-2 py-1 bg-white focus:outline-none focus:bg-brutalYellow font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-[9px] uppercase tracking-wider text-black/60">Database</label>
                <input
                  type="text"
                  placeholder="e.g. hospital"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className="w-full border-2 border-black px-2 py-1 bg-white focus:outline-none focus:bg-brutalYellow font-bold"
                />
              </div>

              {/* Status / Error Block */}
              {testStatus && (
                <div className={`p-2.5 border border-black flex items-start gap-1.5 font-bold ${
                  testStatus === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                }`}>
                  {testStatus === "success" ? <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                  <span className="text-[10px] leading-relaxed break-words">{testMessage}</span>
                </div>
              )}

              {connectError && (
                <div className="p-2.5 border border-black bg-red-50 text-red-800 flex items-start gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="text-[10px] leading-relaxed break-words">{connectError}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testLoading || connectLoading}
                  className="flex-grow py-2 border-2 border-black bg-white shadow-brutal-sm font-extrabold uppercase hover:bg-brutalSage text-[10px] active:translate-y-0.5 flex items-center justify-center gap-1"
                >
                  {testLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  <span>Test</span>
                </button>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={testLoading || connectLoading}
                  className="flex-grow py-2 border-2 border-black bg-brutalYellow shadow-brutal-sm font-extrabold uppercase text-[10px] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-1"
                >
                  {connectLoading ? <Loader2 className="w-3 h-3 animate-spin text-black" /> : null}
                  <span>Connect</span>
                </button>
              </div>

              {isCustomDbActive && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-1.5 border border-black hover:bg-red-50 text-[9px] uppercase font-extrabold text-black/75 tracking-wider bg-white mt-1 active:translate-y-0.5"
                >
                  Disconnect & Revert
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

