import React from "react";
import { HelpCircle } from "lucide-react";

export default function ExplanationPanel({ explanation }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-md shadow-slate-200/40 flex flex-col h-full">
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
          <HelpCircle className="w-4 h-4 text-indigo-650" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Query Explanation</h3>
      </div>

      <div className="flex-grow space-y-4.5 text-[15px] text-slate-650 font-medium leading-relaxed">
        {explanation.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3.5 leading-relaxed">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center font-mono text-[11px] text-indigo-600 font-bold shadow-sm">
              {idx + 1}
            </span>
            <p className="pt-0.5 leading-relaxed">
              {step.split(/(`[^`]+`)/g).map((part, pIdx) => {
                if (part.startsWith("`") && part.endsWith("`")) {
                  return (
                    <code key={pIdx} className="bg-slate-50 border border-slate-200 text-indigo-700 py-0.5 px-2 rounded-lg font-mono text-[12px] mx-0.5">
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                return part;
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
