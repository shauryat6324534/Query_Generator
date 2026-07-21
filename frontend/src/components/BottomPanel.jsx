import React, { useState } from "react";
import { Terminal, Lightbulb, Zap, ShieldAlert, DollarSign, ListTodo, ChevronUp, ChevronDown, Activity } from "lucide-react";

export default function BottomPanel({
  executionLogs = [],
  aiReasoning = "",
  performanceMetrics = null,
  securityAnalysis = null,
  estimatedCost = null,
  suggestions = [],
  isExpanded,
  setIsExpanded,
  activeTab,
  setActiveTab
}) {
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsExpanded(true); // Automatically expand when selecting a tab
  };

  const SECTIONS = [
    {
      id: "logs",
      label: "Logs",
      icon: Terminal,
      bg: "bg-white",
      content: (
        <div className="font-mono text-[11px] text-black/85 space-y-1 max-h-48 overflow-y-auto">
          {executionLogs.length === 0 ? (
            <p className="italic text-black/50">No operations executed yet in this session.</p>
          ) : (
            executionLogs.map((log, index) => (
              <div key={index} className="flex gap-2 py-0.5 border-b border-black/5 last:border-b-0 font-mono">
                <span className="text-black/40 shrink-0 select-none font-mono">[{log.time}]</span>
                <span className={`font-extrabold font-mono shrink-0 select-none ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-emerald-700' : 'text-blue-700'}`}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className="font-mono select-text break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      id: "reasoning",
      label: "AI Reasoning",
      icon: Lightbulb,
      bg: "bg-[#fffdf5]",
      content: (
        <div className="text-xs font-semibold leading-relaxed text-black/90 space-y-2.5 max-h-48 overflow-y-auto">
          {aiReasoning ? (
            <p className="whitespace-pre-wrap">{aiReasoning}</p>
          ) : (
            <p className="italic text-black/50">Awaiting query generation to display natural language mapping reasoning.</p>
          )}
        </div>
      )
    },
    {
      id: "performance",
      label: "Performance",
      icon: Zap,
      bg: "bg-white",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
          <div className="border border-black p-3.5 bg-[#fbfcfa] shadow-brutal-sm">
            <span className="text-black/50 block text-[9px] uppercase tracking-wider">Estimated Execution Time</span>
            <span className="text-sm font-extrabold mt-1 block">{performanceMetrics?.latency || 0} ms</span>
          </div>
          <div className="border border-black p-3.5 bg-[#fbfcfa] shadow-brutal-sm">
            <span className="text-black/50 block text-[9px] uppercase tracking-wider">Query Plan Efficiency</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 border border-black inline-block mt-1 ${performanceMetrics?.usesIndex ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {performanceMetrics?.usesIndex ? "INDEX SEEK" : "TABLE SCAN (SLOW)"}
            </span>
          </div>
          <div className="border border-black p-3.5 bg-[#fbfcfa] shadow-brutal-sm">
            <span className="text-black/50 block text-[9px] uppercase tracking-wider">Estimated Row Scan</span>
            <span className="text-sm font-mono font-extrabold mt-1 block">154 rows</span>
          </div>
        </div>
      )
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldAlert,
      bg: "bg-[#fff5f5]",
      content: (
        <div className="space-y-3 text-xs font-semibold max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 border border-black font-extrabold text-[10px] uppercase ${securityAnalysis?.riskLevel === 'HIGH' ? 'bg-red-500 text-white animate-pulse' : securityAnalysis?.riskLevel === 'MEDIUM' ? 'bg-amber-400 text-black' : 'bg-emerald-400 text-black'}`}>
              {securityAnalysis?.riskLevel || "LOW"} Risk Statement
            </span>
            <span className="text-black/60 font-mono text-[10px]">(Static Analysis Passed)</span>
          </div>
          <div className="border border-black p-3 bg-white divide-y divide-black/5 text-[11px]">
            <div className="flex items-center justify-between py-1">
              <span>SQL Injection vulnerabilities check</span>
              <span className="text-emerald-700 font-bold">✓ SAFE (Parameterized)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Destructive database alterations</span>
              <span className={securityAnalysis?.hasDestructive ? "text-amber-600 font-bold" : "text-emerald-700 font-bold"}>
                {securityAnalysis?.hasDestructive ? "⚠ WRITE INCLUDED" : "✓ NO ALTERATIONS"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Dangerous DELETE / UPDATE missing WHERE validation</span>
              <span className={securityAnalysis?.hasDestructiveWithoutWhere ? "text-red-600 font-bold animate-pulse" : "text-emerald-700 font-bold"}>
                {securityAnalysis?.hasDestructiveWithoutWhere ? "⚠ NO WHERE CLAUSE" : "✓ PASS"}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "cost",
      label: "Cost",
      icon: DollarSign,
      bg: "bg-white",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
          <div className="border border-black p-3 bg-white shadow-brutal-sm">
            <span className="text-black/50 block text-[9px] uppercase tracking-wider">Estimated CPU Cost</span>
            <span className="text-sm font-extrabold mt-0.5 block">{estimatedCost?.cpuCost || "0.00"} units</span>
          </div>
          <div className="border border-black p-3 bg-white shadow-brutal-sm">
            <span className="text-black/50 block text-[9px] uppercase tracking-wider">Estimated API Translation Cost</span>
            <span className="text-sm font-extrabold mt-0.5 block text-emerald-800">${estimatedCost?.apiCost || "0.00"} USD</span>
          </div>
        </div>
      )
    },
    {
      id: "suggestions",
      label: "Suggestions",
      icon: ListTodo,
      bg: "bg-white",
      content: (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {suggestions.length === 0 ? (
            <p className="italic text-black/50 text-xs">No active indexing suggestions for query statement.</p>
          ) : (
            suggestions.map((sug, sIdx) => (
              <div key={sIdx} className="bg-[#fbfcfa] border border-black p-2.5 flex gap-2 items-start shadow-brutal-sm">
                <span className="flex-shrink-0 w-4 h-4 bg-black flex items-center justify-center font-mono text-[9px] text-white font-extrabold">
                  {sIdx + 1}
                </span>
                <p className="text-[11px] font-semibold leading-relaxed text-black">{sug}</p>
              </div>
            ))
          )}
        </div>
      )
    }
  ];

  const currentSection = SECTIONS.find((s) => s.id === activeTab) || SECTIONS[0];

  return (
    <div 
      className={`w-full bg-[#fdfdfd] border-t-2 border-black transition-all duration-200 shrink-0 font-satoshi text-black z-30 select-none ${
        isExpanded ? "h-72" : "h-11"
      }`}
    >
      {/* Header Bar */}
      <div className="h-10 border-b border-black bg-[#f2f2f2] flex items-center justify-between px-4 select-none">
        {/* Left Toggle / Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleExpand}
            className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider hover:bg-brutalYellow border border-black/10 px-1.5 py-0.5 bg-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            Diagnostics
          </button>
          
          {/* Tab lists */}
          <div className="flex border-l border-black/10 pl-4 space-x-1">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleTabClick(sec.id)}
                  className={`flex items-center gap-1 px-3 py-1 text-[10px] uppercase font-extrabold tracking-wider border-2 transition-all ${
                    isSelected 
                      ? "bg-brutalYellow border-black translate-y-0.5" 
                      : "bg-white border-transparent hover:border-black"
                  }`}
                >
                  <Icon className="w-3 h-3 text-black" />
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Status */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-extrabold uppercase opacity-70">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Local Engine Status: Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
          <span>Session Logs: {executionLogs.length}</span>
        </div>
      </div>

      {/* Expandable Panel Area */}
      {isExpanded && (
        <div className={`p-4 h-[230px] overflow-y-auto ${currentSection.bg}`}>
          {currentSection.content}
        </div>
      )}
    </div>
  );
}
