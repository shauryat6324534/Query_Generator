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

/**
 * @param {object} props
 * @param {string} props.prompt
 * @param {function} props.setPrompt
 * @param {function} props.onGenerate
 * @param {boolean} props.isLoading
 */
export default function QueryInput({ prompt, setPrompt, onGenerate, isLoading }) {
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
    <div className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <label htmlFor="prompt-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Describe your SQL request</span>
            </label>
            <p className="text-xs text-slate-400 mt-0.5">Type in plain English what data you want to retrieve or alter</p>
          </div>
          
          <span className="text-xs font-mono text-slate-500 self-end md:self-auto">
            {prompt.length} / {maxChars} characters
          </span>
        </div>

        {/* Textarea container with glowing focus rings */}
        <div className="relative group">
          <textarea
            id="prompt-input"
            rows="4"
            value={prompt}
            onChange={handleTextareaChange}
            disabled={isLoading}
            placeholder="e.g. Show all active customers who purchased a premium subscription in the last quarter..."
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 resize-y disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-500 shadow-inner"
          />
        </div>

        {/* Quick templates section */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Templates</h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_EXAMPLES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleChipClick(item.prompt)}
                disabled={isLoading}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  prompt === item.prompt
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/60 shadow-md shadow-indigo-500/5"
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`w-full md:w-auto inline-flex items-center justify-center space-x-2.5 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isLoading || !prompt.trim()
                ? "bg-slate-800/80 text-slate-500 border border-slate-800/40 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 hover:shadow-lg hover:shadow-indigo-600/20 border border-indigo-500/20"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Translating query...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-indigo-300 fill-current" />
                <span>Generate SQL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
