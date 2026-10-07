import React from 'react';
import { ShieldCheck, AlertCircle, Eye, Smartphone } from 'lucide-react';
import { ThemeMode } from '../types';

interface ComplianceAdvisorProps {
  complianceGuard: boolean;
  onToggleComplianceGuard: (val: boolean) => void;
  isTabHidden: boolean;
  score: number;
  theme?: ThemeMode;
}

export const ComplianceAdvisor: React.FC<ComplianceAdvisorProps> = ({
  complianceGuard,
  onToggleComplianceGuard,
  isTabHidden,
  score,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl border transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-900/90 border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>Ad Network Compliance & IVT Guard</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                Score: {score}%
              </span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              IAB Tech Lab & Google Publisher Policy compliance guide
            </p>
          </div>
        </div>

        {/* Viewability Guard Switch */}
        <label className={`flex items-center gap-2.5 cursor-pointer select-none px-3 py-1.5 rounded-xl border ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <input
            id="iab-guard-toggle"
            type="checkbox"
            checked={complianceGuard}
            onChange={(e) => onToggleComplianceGuard(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
          />
          <div className="text-left">
            <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Enforce Viewability Guard
            </div>
            <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Auto-pauses when tab loses focus
            </div>
          </div>
        </label>
      </div>

      {/* Real-time Status Card */}
      <div className={`my-4 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isTabHidden ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
          <div>
            <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isTabHidden ? 'Tab Hidden (Background)' : 'Viewport Active & 100% In-View'}
            </div>
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isTabHidden 
                ? 'Impressions paused to prevent Invalid Traffic (IVT) flags' 
                : 'Meets Media Rating Council (MRC) video viewability threshold'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Fraud Risk:</span>
          <span className="text-emerald-500 font-semibold">Low (Clean Traffic)</span>
        </div>
      </div>

      {/* Critical Publisher Policy Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className={`p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Preventing Account Bans</span>
          </div>
          <p className={`leading-relaxed text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real ad networks (Google AdSense, AdMob, AppLovin) ban accounts that run continuous unattended bot scripts. Sustainable revenue requires real user impressions.
          </p>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Eye className="w-4 h-4 text-blue-500" />
            <span>Compliant Rewarded Batching</span>
          </div>
          <p className={`leading-relaxed text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Legitimate apps batch up to 5-10 rewarded ads by offering real value (e.g. unlocking game items, extra cloud storage, or premium content) with explicit user consent.
          </p>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Live SDK Integration</span>
          </div>
          <p className={`leading-relaxed text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            For production deployment, integrate the Google Interactive Media Ads (IMA) SDK or AdMob Rewarded Video API to route real advertiser bids directly to your account.
          </p>
        </div>
      </div>
    </div>
  );
};
