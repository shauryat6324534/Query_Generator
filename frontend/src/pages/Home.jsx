import React, { useState } from "react";
import { Database, Sparkles, Terminal, FileCode, CheckSquare, Layers } from "lucide-react";
import QueryInput from "../components/QueryInput";
import ResultPanel from "../components/ResultPanel";
import { getMockResponse } from "../utils/mockData";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const data = await getMockResponse(prompt);
      setResult(data);
    } catch (err) {
      console.error("Error generating mock response: ", err);
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
                  v0.2.0 (UI Workspace)
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Generate, explain, and validate SQL queries instantly</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Demo Environment
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
              This sandbox illustrates the natural language translation pipeline. Choose an template below to check out the generation capabilities including explanation cards and safety analytics.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 self-start md:self-auto border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-6">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Database</span>
              <p className="text-xs font-bold text-slate-300 mt-0.5">Mock Sandbox</p>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Translator</span>
              <p className="text-xs font-bold text-indigo-400 mt-0.5">Static Pipeline</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid split: Input (Top) and Results (Bottom) */}
        <div className="space-y-8">
          <QueryInput
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Generated Output Workspace</h3>
            <ResultPanel result={result} />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} AI SQL Query Generator UI. All operations sandboxed.</p>
          <div className="flex space-x-5">
            <span className="hover:text-slate-400 transition-colors">Sprint 2 Completed</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Vite + React + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
