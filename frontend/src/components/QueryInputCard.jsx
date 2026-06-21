import React from "react";
import { Sparkles, Loader2, Play } from "lucide-react";

const QUICK_EXAMPLES = [
  {
    id: "salary",
    label: "Employee Salaries",
    prompt: "Show all employees whose salary is greater than 50000",
  },
  {
    id: "sales",
    label: "Product Sales",
    prompt: "Get the total sales for each product in the last 30 days",
  },
  {
    id: "inactive",
    label: "Inactive Customers",
    prompt: "Find customers who registered in 2025 but haven't placed any orders",
  },
  {
    id: "logs",
    label: "Prune Old Logs",
    prompt: "Delete all logs older than 6 months",
  },
  {
    id: "departments",
    label: "Top Departments",
    prompt: "Calculate the average department rating, group by department name, having average rating > 4.5",
  }
];

export default function QueryInputCard({ prompt, setPrompt, onGenerate, isLoading }) {
  const maxChars = 500;

  const handleChipClick = (examplePrompt) => {
    if (isLoading) return;
    setPrompt(examplePrompt);
  };

  const handleTextareaChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setPrompt(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate();
  };

  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-3xl p-8 shadow-lg shadow-slate-200/50 relative overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <label htmlFor="prompt-input" className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-500 fill-current" />
              <span>Describe your SQL request</span>
            </label>
            <p className="text-sm text-slate-400 mt-1 font-semibold">Type in plain English what data you want to retrieve or alter</p>
          </div>
          
          <span className="text-xs font-mono text-slate-400 font-semibold self-end md:self-auto bg-slate-105 px-2.5 py-1 rounded-md border border-slate-200/60">
            {prompt.length} / {maxChars} characters
          </span>
        </div>

        <div className="relative group">
          <textarea
            id="prompt-input"
            rows="5"
            value={prompt}
            onChange={handleTextareaChange}
            disabled={isLoading}
            placeholder="e.g. Show all active customers who purchased a premium subscription in the last quarter..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-2xl p-5 text-base font-sans leading-relaxed focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 resize-y disabled:opacity-60 disabled:cursor-not-allowed placeholder-slate-400 shadow-inner"
          />
        </div>

        {/* Quick templates section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Quick Templates</h3>
          <div className="flex flex-wrap gap-2.5">
            {QUICK_EXAMPLES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleChipClick(item.prompt)}
                disabled={isLoading}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all duration-200 shadow-sm ${
                  prompt === item.prompt
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-slate-50 text-slate-650 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`w-full md:w-auto inline-flex items-center justify-center space-x-2.5 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
              isLoading || !prompt.trim()
                ? "bg-slate-100 text-slate-400 border border-slate-250/40 cursor-not-allowed shadow-none"
                : "bg-indigo-650 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100/60 text-white border border-indigo-500/10 active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-450" />
                <span>Translating query...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-indigo-200 fill-current" />
                <span>Generate SQL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
