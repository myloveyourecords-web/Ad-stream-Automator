import React, { useState } from 'react';
import { AdCreative, BatchProgress, ThemeMode } from '../types';
import { AdVisualStage } from './AdVisualStage';
import { 
  Play, Pause, FastForward, ExternalLink, ShieldCheck, 
  Volume2, VolumeX, DollarSign, AlertTriangle 
} from 'lucide-react';

interface AdPlayerProps {
  ad: AdCreative;
  batchProgress: BatchProgress;
  onTogglePlay: () => void;
  onSkipAd: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isTabHidden: boolean;
  complianceGuard: boolean;
  accountEmail: string;
  theme?: ThemeMode;
}

export const AdPlayer: React.FC<AdPlayerProps> = ({
  ad,
  batchProgress,
  onTogglePlay,
  onSkipAd,
  soundEnabled,
  onToggleSound,
  isTabHidden,
  complianceGuard,
  accountEmail,
  theme = 'dark',
}) => {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const impressionValue = ad.cpm / 1000;
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative flex flex-col transition-colors duration-200 border ${
      isDark 
        ? 'bg-slate-900/90 border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      {/* Top Header: Batch Counter & Payout Destination */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-500 font-semibold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Ad {batchProgress.currentAdIndex + 1} of {batchProgress.totalAdsInBatch}</span>
          </div>

          <span className={`text-xs hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
            isDark 
              ? 'text-slate-400 bg-slate-800/80 border-slate-700' 
              : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}>
            <span>Format:</span>
            <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{ad.format}</strong>
          </span>
        </div>

        {/* Target Crediting Account Pill */}
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/80' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Crediting:</span>
          <span className="font-mono font-medium text-emerald-500 truncate max-w-[180px] sm:max-w-[240px]">
            {accountEmail}
          </span>
          <span className="inline-flex items-center text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Verified
          </span>
        </div>
      </div>

      {/* Main Video Ad Screen Frame */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <AdVisualStage 
          ad={ad} 
          isPlaying={batchProgress.isPlaying && !(complianceGuard && isTabHidden)}
          progressPercent={batchProgress.progressPercent}
        />

        {/* Tab Hidden Compliance Overlay (Paused to protect from IVT) */}
        {complianceGuard && isTabHidden && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Playback Paused (Viewability Guard)</h4>
            <p className="text-sm text-slate-300 max-w-md">
              Window focus lost. In accordance with IAB & Ad Network Anti-Fraud policies, autoplay is paused to ensure 100% genuine viewable impressions.
            </p>
            <span className="mt-3 text-xs text-amber-400/90 font-mono bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/20">
              Return to tab to resume batch revenue generation
            </span>
          </div>
        )}

        {/* Floating Screen Badges: Countdown Ring & Sound */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            id="toggle-ad-sound-btn"
            onClick={onToggleSound}
            aria-label="Toggle Ad Audio"
            className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/80 flex items-center justify-center border border-white/10 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Countdown timer badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white font-mono text-sm font-semibold shadow-lg">
            <span className="text-amber-400">{batchProgress.secondsLeft}s</span>
          </div>
        </div>

        {/* Floating Impression Value Badge */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg">
          <DollarSign className="w-3.5 h-3.5" />
          <span>+${impressionValue.toFixed(4)} on finish</span>
        </div>
      </div>

      {/* Ad Controls Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        {/* Play/Pause & Skip */}
        <div className="flex items-center gap-3">
          <button
            id="play-pause-batch-btn"
            onClick={onTogglePlay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
          >
            {batchProgress.isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Batch</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Batch</span>
              </>
            )}
          </button>

          <button
            id="skip-current-ad-btn"
            onClick={onSkipAd}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all active:scale-95 ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Advance to next ad in batch"
          >
            <FastForward className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
            <span>Next Ad</span>
          </button>
        </div>

        {/* Sponsor CTA / Interactive Visit Button */}
        <div className="flex items-center gap-3">
          <button
            id="visit-sponsor-cta-btn"
            onClick={() => setShowOfferModal(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all group ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            <span>{ad.ctaText}</span>
          </button>
        </div>
      </div>

      {/* Real-time Tracking Pixel / VAST Telemetry Feed */}
      <div className={`mt-5 pt-4 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
        isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>VAST 4.2 Telemetry:</span>
          <span className={`font-mono font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {batchProgress.progressPercent >= 100
              ? 'Complete (Impression Credited)'
              : batchProgress.progressPercent >= 75
              ? 'Quartile 3 (75% Verified)'
              : batchProgress.progressPercent >= 50
              ? 'Midpoint (50% Verified)'
              : batchProgress.progressPercent >= 25
              ? 'Quartile 1 (25% Verified)'
              : 'Impression Started'}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span>CPM Rate: <strong className={isDark ? 'text-white' : 'text-slate-900'}>${ad.cpm.toFixed(2)}</strong></span>
          <span>•</span>
          <span>Batch Progress: <strong className="text-blue-500">{batchProgress.currentAdIndex + 1}/10</strong></span>
        </div>
      </div>

      {/* Simulated Sponsor Landing Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/20 text-blue-500 border border-blue-500/30">
                Sponsor Offer
              </span>
              <button 
                onClick={() => setShowOfferModal(false)}
                className={`text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                ✕ Close
              </button>
            </div>

            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{ad.brand}</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{ad.headline}</p>
            
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 mb-5 ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{ad.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="font-mono text-blue-500 truncate">{ad.ctaUrl}</span>
              </div>
              <div className="flex justify-between">
                <span>Engagement Credit:</span>
                <span className="text-emerald-500 font-semibold">+100% View Through</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                Continue Watching Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
