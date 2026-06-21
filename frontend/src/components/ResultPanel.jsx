import React from "react";
import { Terminal } from "lucide-react";
import SQLPanel from "./SQLPanel";
import ExplanationPanel from "./ExplanationPanel";
import ImpactPanel from "./ImpactPanel";
import ResultsTable from "./ResultsTable";

export default function ResultPanel({
  result,
  onExecute,
  executeLoading,
  executeError,
  executeResults,
  onExportCSV,
  exportLoading
}) {
  if (!result) {
    return (
      <div className="w-full border border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/50 min-h-[300px] shadow-sm">
        <div className="p-4 bg-slate-50 rounded-full border border-slate-100 text-slate-400">
          <Terminal className="w-8 h-8" />
        </div>
        <div className="max-w-sm">
          <h3 className="text-sm font-semibold text-slate-800">Awaiting your prompt</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Choose a quick template above or write custom instructions to generate SQL queries, logic summaries, and safety analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10">
      {/* 1. Generated SQL Panel */}
      <SQLPanel
        sql={result.sql}
        onExecute={onExecute}
        executeLoading={executeLoading}
      />

      {/* 2. Grid for Explanation and Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <ExplanationPanel explanation={result.explanation} />
        <ImpactPanel impact={result.impact} />
      </div>

      {/* 3. Query Results Table */}
      <ResultsTable
        executeResults={executeResults}
        executeLoading={executeLoading}
        executeError={executeError}
        onExportCSV={onExportCSV}
        exportLoading={exportLoading}
      />
    </div>
  );
}
