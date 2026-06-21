import React from "react";
import { ShieldAlert, Layers, AlertTriangle, ArrowRight } from "lucide-react";

export default function ImpactPanel({ impact }) {
  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH":
        return {
          bg: "bg-rose-50/70 border-rose-100/60 text-rose-800",
          text: "text-rose-700 border-rose-200/60 bg-rose-50",
          badge: "bg-rose-100 text-rose-800"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50/70 border-amber-100/60 text-amber-800",
          text: "text-amber-700 border-amber-200/60 bg-amber-50",
          badge: "bg-amber-100 text-amber-800"
        };
      case "LOW":
      default:
        return {
          bg: "bg-emerald-50/70 border-emerald-100/60 text-emerald-850",
          text: "text-emerald-700 border-emerald-200/60 bg-emerald-50",
          badge: "bg-emerald-100 text-emerald-800"
        };
    }
  };

  const riskStyle = getRiskColor(impact.riskLevel);

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-md shadow-slate-200/40 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
            <ShieldAlert className="w-4 h-4 text-indigo-655" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Impact & Safety</h3>
        </div>
        
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide uppercase ${riskStyle.text}`}>
          {impact.riskLevel} Risk
        </span>
      </div>

      {/* Modern KPI Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rows Affected</p>
          <p className="text-2xl font-black font-mono text-slate-800 mt-1">
            {impact.rowsAffected.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Est. Rows Returned</p>
          <p className="text-2xl font-black font-mono text-slate-800 mt-1">
            {impact.rowsReturned.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Accessed Tables */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5 pl-0.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Accessed Tables</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {impact.tables.length === 0 ? (
            <span className="text-xs text-slate-450 font-semibold italic pl-1">None</span>
          ) : (
            impact.tables.map((table, tIdx) => (
              <span key={tIdx} className="text-[10px] font-mono font-bold px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg shadow-sm">
                {table}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Warnings Section */}
      <div className="space-y-3 pt-1 border-t border-slate-100">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Performance Advisory</span>
        </h4>
        <div className={`p-4.5 rounded-2xl border text-xs leading-relaxed space-y-3 shadow-inner ${riskStyle.bg}`}>
          {impact.warnings.map((warn, wIdx) => (
            <div key={wIdx} className="flex gap-2.5 items-start">
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-500" />
              <p className="text-slate-755 text-[12px] font-semibold leading-relaxed">{warn}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
