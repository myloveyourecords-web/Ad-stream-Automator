import React from 'react';
import { PlaySquare, DollarSign, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface NavbarProps {
  currentBalance: number;
  accountEmail: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  batchCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBalance,
  accountEmail,
  soundEnabled,
  onToggleSound,
  batchCount,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-200 border-b ${
      isDark 
        ? 'bg-slate-950/80 border-slate-800/80 text-white' 
        : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <PlaySquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Ad Revenue Batch Player
              </h1>
              <span className={`hidden sm:inline-flex items-center text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                10-Ad Batch Engine
              </span>
            </div>
            <div className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Auto-playing batch impressions to <span className={`font-mono font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{accountEmail}</span>
            </div>
          </div>
        </div>

        {/* Right side live balance & controls */}
        <div className="flex items-center gap-2.5">
          {/* Theme switcher */}
          <button
            id="nav-theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800' 
                : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-300'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sound toggle */}
          <button
            id="nav-sound-toggle"
            onClick={onToggleSound}
            aria-label="Toggle sound effects"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            )}
          </button>

          {/* Live Balance Pill */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border ${
            isDark 
              ? 'bg-slate-900 border-slate-800' 
              : 'bg-slate-50 border-slate-200 shadow-inner'
          }`}>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className={`text-[10px] font-medium leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Accrued Balance
              </div>
              <div className="text-sm font-bold font-mono text-emerald-500 leading-tight">
                ${currentBalance.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
