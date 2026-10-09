import React from "react";
import { Sparkles, Loader2, Play, HelpCircle, ShieldAlert, Zap, XCircle } from "lucide-react";

export default function QueryInputCard({
  prompt,
  setPrompt,
  onGenerate,
  onExplain,
  onValidate,
  onOptimize,
  onClear,
  sqlExists,
  isLoading,
  explainLoading,
  validateLoading,
  optimizeLoading
}) {
  const maxChars = 500;

  const handleTextareaChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setPrompt(e.target.value);
    }
  };

  const handleGenerateClick = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate();
  };

  return (
    <div className="w-full bg-white border-2 border-black rounded-none md:rounded-lg p-6 md:p-8 shadow-brutal-lg relative overflow-hidden font-satoshi text-black">
      <form onSubmit={handleGenerateClick} className="space-y-6">
        {/* Title and Char Counter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <label htmlFor="prompt-input" className="text-xl font-extrabold text-black flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-black fill-brutalYellow stroke-[2px]" />
              <span>Natural Language Prompt Editor</span>
            </label>
            <p className="text-xs font-semibold text-black/60 mt-1">Describe in plain English what query actions you want to generate or validate.</p>
          </div>
          
          <span className="text-xs font-mono text-black font-extrabold self-end md:self-auto bg-[#f5f5f5] px-2.5 py-1 border-2 border-black shadow-brutal-sm">
            {prompt.length} / {maxChars} characters
          </span>
        </div>

        {/* Text Area */}
        <div className="relative group">
          <textarea
            id="prompt-input"
            rows="4"
            value={prompt}
            onChange={handleTextareaChange}
            disabled={isLoading || explainLoading || validateLoading || optimizeLoading}
            placeholder="e.g. Show all active customers who purchased a premium subscription in the last quarter..."
            className="w-full bg-white border-2 border-black text-black placeholder-black/50 p-5 text-base font-medium leading-relaxed focus:outline-none focus:bg-brutalYellow/10 transition-colors resize-y disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
          />
        </div>

        {/* Control Action Buttons Row */}
        <div className="flex flex-wrap gap-3.5 pt-4 border-t-2 border-black/10">
          {/* Generate SQL Button */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || explainLoading || validateLoading || optimizeLoading}
            className="brutal-btn flex items-center justify-center gap-2 py-3 px-5 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-brutalYellow fill-current" />
                <span>Generate SQL</span>
              </>
            )}
          </button>

          {/* Explain Query Button */}
          <button
            type="button"
            onClick={onExplain}
            disabled={!sqlExists || explainLoading || isLoading || validateLoading || optimizeLoading}
            className="brutal-btn-secondary flex items-center justify-center gap-2 py-3 px-5 text-xs font-extrabold uppercase tracking-wider bg-brutalYellow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {explainLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3.5 h-3.5 text-black" />
                <span>Explain Query</span>
              </>
            )}
          </button>

          {/* Validate Query Button */}
          <button
            type="button"
            onClick={onValidate}
            disabled={!sqlExists || validateLoading || isLoading || explainLoading || optimizeLoading}
            className="brutal-btn-secondary flex items-center justify-center gap-2 py-3 px-5 text-xs font-extrabold uppercase tracking-wider bg-brutalSage disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validateLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-black" />
                <span>Validate Query</span>
              </>
            )}
          </button>

          {/* Optimize Query Button */}
          <button
            type="button"
            onClick={onOptimize}
            disabled={!sqlExists || optimizeLoading || isLoading || explainLoading || validateLoading}
            className="brutal-btn-secondary flex items-center justify-center gap-2 py-3 px-5 text-xs font-extrabold uppercase tracking-wider bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {optimizeLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-black" />
                <span>Optimize Query</span>
              </>
            )}
          </button>

          {/* Clear Prompt Button */}
          <button
            type="button"
            onClick={onClear}
            disabled={!prompt && !sqlExists}
            className="brutal-btn-secondary flex items-center justify-center gap-2 py-3 px-5 text-xs font-extrabold uppercase tracking-wider bg-white ml-auto disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 hover:text-red-750"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Clear Prompt</span>
          </button>
        </div>
      </form>
    </div>
  );
}
