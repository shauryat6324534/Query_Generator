import React from "react";
import { Table, Download, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

export default function ResultsTable({
  executeResults,
  executeLoading,
  executeError,
  onExportCSV,
  exportLoading
}) {
  if (!executeResults && !executeLoading && !executeError) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/40">
      <div className="px-8 py-5 border-b border-slate-200/60 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
            <Table className="w-4 h-4 text-indigo-650" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Query Execution Results</h3>
        </div>

        {executeResults && Array.isArray(executeResults) && executeResults.length > 0 && (
          <button
            type="button"
            onClick={onExportCSV}
            disabled={exportLoading}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-55 border border-slate-200 hover:border-slate-350 py-2 px-4 rounded-xl transition-all disabled:opacity-50"
          >
            {exportLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Export CSV</span>
          </button>
        )}
      </div>

      <div className="p-8">
        {executeLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Running query against database...</p>
          </div>
        )}

        {executeError && (
          <div className="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs flex items-start gap-3 shadow-inner">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900 text-sm">Execution Failed</p>
              <p className="text-[12px] text-rose-700 font-semibold leading-relaxed">{executeError}</p>
            </div>
          </div>
        )}

        {executeResults && !executeLoading && !executeError && (
          <>
            {Array.isArray(executeResults) ? (
              executeResults.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 font-semibold leading-relaxed">
                  Query executed successfully.<br />No rows returned.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-inner bg-slate-50/10">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/50 text-slate-650 border-b border-slate-200/60">
                        {Object.keys(executeResults[0]).map((key) => (
                          <th key={key} className="py-3.5 px-6 font-bold select-none uppercase tracking-wider text-[10px] text-slate-500">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {executeResults.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-slate-100 py-3.5 px-6 text-slate-700 bg-white hover:bg-slate-50/30 transition-colors"
                        >
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="py-3.5 px-6 font-mono text-[11px]">
                              {val === null || val === undefined ? (
                                <span className="text-slate-400 font-sans italic">NULL</span>
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
              <div className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-850 rounded-2xl text-xs space-y-2.5 shadow-inner">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                  <span className="font-bold text-emerald-900 text-sm">Query Executed Successfully</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-3 text-[12px] text-slate-700 border-t border-emerald-100/60">
                  <div>
                    <span className="text-slate-450 block font-semibold uppercase text-[9px] tracking-wider">Affected Rows</span>
                    <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{executeResults.affectedRows ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 block font-semibold uppercase text-[9px] tracking-wider">Changed Rows</span>
                    <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{executeResults.changedRows ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-455 block font-semibold uppercase text-[9px] tracking-wider">Warning Status</span>
                    <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{executeResults.warningStatus ?? 0}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
