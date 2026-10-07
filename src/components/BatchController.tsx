import React from 'react';
import { BatchProgress, BatchSettings, DurationMode, ThemeMode } from '../types';
import { 
  Check, RotateCcw, Zap, Clock, Layers, ArrowRight 
} from 'lucide-react';

interface BatchControllerProps {
  batchProgress: BatchProgress;
  settings: BatchSettings;
  onUpdateSettings: (settings: Partial<BatchSettings>) => void;
  onRestartBatch: () => void;
  onStartNewBatch: () => void;
  onSelectAdIndex: (index: number) => void;
  theme?: ThemeMode;
}

export const BatchController: React.FC<BatchControllerProps> = ({
  batchProgress,
  settings,
  onUpdateSettings,
  onRestartBatch,
  onStartNewBatch,
  onSelectAdIndex,
  theme = 'dark',
}) => {
  const steps = Array.from({ length: batchProgress.totalAdsInBatch }, (_, i) => i);
  const isDark = theme === 'dark';

  const durationOptions: { id: DurationMode; label: string; sec: number; icon: React.ReactNode }[] = [
    { id: 'speed_5s', label: 'Fast 5s', sec: 5, icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'standard_10s', label: 'Standard 8s', sec: 8, icon: <Clock className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'full_15s', label: 'Full 15s', sec: 15, icon: <Clock className="w-3.5 h-3.5 text-emerald-500" /> },
  ];

  return (
    <div className={`rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl border transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-900/90 border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      {/* Batch Header & Stats */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Batch #{batchProgress.batchId}
              </h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                10-Ad Cycle
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Autoplay sequence: {batchProgress.completedInCurrentBatch} of 10 ads verified
            </p>
          </div>
        </div>

        {/* Current Batch Earnings Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Batch Yield</div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-500">
              +${batchProgress.batchEarned.toFixed(4)}
            </div>
          </div>

          <button
            id="restart-batch-btn"
            onClick={onRestartBatch}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
            }`}
            title="Restart current 10-ad batch from Ad 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 10-Ad Visual Step Ribbon */}
      <div className="my-5">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {steps.map((idx) => {
            const isCompleted = idx < batchProgress.completedInCurrentBatch;
            const isCurrent = idx === batchProgress.currentAdIndex;

            return (
              <button
                key={idx}
                id={`batch-step-ad-${idx + 1}`}
                onClick={() => onSelectAdIndex(idx)}
                className={`group relative flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/40 text-blue-500'
                    : isCompleted
                    ? isDark
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:border-emerald-500'
                    : isDark
                      ? 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full mb-1">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      {idx + 1}
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-medium">{idx + 1}</span>
                  )}
                </div>

                <span className="text-[10px] font-medium tracking-tight truncate max-w-full">
                  Ad #{idx + 1}
                </span>

                {isCurrent && (
                  <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Autoplay Pacing & Automation Controls */}
      <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        {/* Ad Duration Speed Preset */}
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ad Pacing:</span>
          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {durationOptions.map((opt) => (
              <button
                key={opt.id}
                id={`pacing-option-${opt.id}`}
                onClick={() => onUpdateSettings({ durationMode: opt.id })}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  settings.durationMode === opt.id
                    ? isDark 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold' 
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200 font-semibold'
                    : isDark 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Continuous Batch Autoplay */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="auto-continue-next-batch-checkbox"
              type="checkbox"
              checked={settings.autoContinueNextBatch}
              onChange={(e) => onUpdateSettings({ autoContinueNextBatch: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Auto-roll next batch
            </span>
          </label>

          {/* New Batch trigger if complete */}
          {batchProgress.completedInCurrentBatch >= batchProgress.totalAdsInBatch && (
            <button
              id="launch-next-batch-btn"
              onClick={onStartNewBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/30"
            >
              <span>Start Batch #{batchProgress.batchId + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
