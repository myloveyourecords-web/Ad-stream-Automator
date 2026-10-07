import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AdCreative, BatchProgress, BatchSettings, AccountProfile, 
  Transaction, DurationMode, ThemeMode 
} from './types';
import { AD_CATALOG } from './data/mockAds';
import { playCoinSound, playBatchCompletedFanfare } from './utils/audio';
import { Navbar } from './components/Navbar';
import { AdPlayer } from './components/AdPlayer';
import { BatchController } from './components/BatchController';
import { AccountDashboard } from './components/AccountDashboard';
import { ComplianceAdvisor } from './components/ComplianceAdvisor';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY_PROFILE = 'ad_revenue_account_profile_v1';
const STORAGE_KEY_TXS = 'ad_revenue_transactions_v1';
const STORAGE_KEY_SETTINGS = 'ad_revenue_settings_v1';
const STORAGE_KEY_THEME = 'ad_revenue_theme_v1';

const DEFAULT_PROFILE: AccountProfile = {
  accountEmail: 'famwraps@gmail.com',
  publisherId: 'pub-434982515972',
  payoutMethod: 'PayPal',
  payoutAddress: 'famwraps@gmail.com',
  lifetimeEarnings: 4.8250,
  currentBalance: 4.8250,
  totalBatchesCompleted: 2,
  totalImpressionsVerified: 20,
  totalPayoutsProcessed: 0,
  averageECPM: 18.40,
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-init-1',
    type: 'batch_revenue',
    amount: 0.1850,
    timestamp: Date.now() - 1000 * 60 * 12,
    description: 'Batch #1 (10/10 Impressions Verified)',
    batchNumber: 1,
    impressions: 10,
    status: 'completed',
    referenceCode: 'BAT-10-001',
  },
  {
    id: 'tx-init-2',
    type: 'batch_revenue',
    amount: 0.1920,
    timestamp: Date.now() - 1000 * 60 * 4,
    description: 'Batch #2 (10/10 Impressions Verified)',
    batchNumber: 2,
    impressions: 10,
    status: 'completed',
    referenceCode: 'BAT-10-002',
  },
  {
    id: 'tx-bonus',
    type: 'bonus',
    amount: 4.4480,
    timestamp: Date.now() - 1000 * 60 * 30,
    description: 'Publisher Onboarding Grant',
    status: 'completed',
    referenceCode: 'BONUS-INIT',
  }
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  // Load stored account profile or use default
  const [profile, setProfile] = useState<AccountProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  // Settings
  const [settings, setSettings] = useState<BatchSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      batchSize: 10,
      durationMode: 'standard_10s',
      autoContinueNextBatch: true,
      soundEnabled: true,
      complianceGuard: true,
      breakBetweenBatchesSec: 2,
    };
  });

  // Transactions ledger
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TXS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Get ad duration in seconds from durationMode
  const getAdDurationSec = useCallback((mode: DurationMode) => {
    switch (mode) {
      case 'speed_5s': return 5;
      case 'standard_10s': return 8;
      case 'full_15s': return 15;
      default: return 8;
    }
  }, []);

  // Batch playback progress state
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    batchId: 3,
    currentAdIndex: 0,
    totalAdsInBatch: 10,
    isPlaying: true, // starts auto-playing directly as requested
    isPaused: false,
    secondsLeft: 8,
    totalDuration: 8,
    progressPercent: 0,
    batchEarned: 0,
    completedInCurrentBatch: 0,
    status: 'playing',
  });

  const [isTabHidden, setIsTabHidden] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // References for timing
  const elapsedMsRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const intermissionTimeoutRef = useRef<number | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  // Tab visibility listener for compliance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Current ad derived from index
  const currentAdIndex = batchProgress.currentAdIndex;
  const currentAd: AdCreative = AD_CATALOG[currentAdIndex % AD_CATALOG.length];

  // Ad Completion / Advancement Handler
  const handleCompleteCurrentAd = useCallback(() => {
    const ad = AD_CATALOG[batchProgress.currentAdIndex % AD_CATALOG.length];
    const impressionRevenue = ad.cpm / 1000;

    // Play coin sound
    playCoinSound(settings.soundEnabled);

    // Update financial profile
    setProfile(prev => {
      const newBalance = prev.currentBalance + impressionRevenue;
      const newLifetime = prev.lifetimeEarnings + impressionRevenue;
      const newImpressions = prev.totalImpressionsVerified + 1;
      return {
        ...prev,
        currentBalance: newBalance,
        lifetimeEarnings: newLifetime,
        totalImpressionsVerified: newImpressions,
      };
    });

    const isLastAdInBatch = batchProgress.currentAdIndex + 1 >= batchProgress.totalAdsInBatch;

    if (!isLastAdInBatch) {
      // Advance to next ad in this batch
      const nextIndex = batchProgress.currentAdIndex + 1;
      const dur = getAdDurationSec(settings.durationMode);
      elapsedMsRef.current = 0;
      setBatchProgress(prev => ({
        ...prev,
        currentAdIndex: nextIndex,
        completedInCurrentBatch: prev.completedInCurrentBatch + 1,
        batchEarned: prev.batchEarned + impressionRevenue,
        secondsLeft: dur,
        totalDuration: dur,
        progressPercent: 0,
      }));
    } else {
      // Completed all 10 ads in this batch!
      const totalBatchEarned = batchProgress.batchEarned + impressionRevenue;
      const completedBatchId = batchProgress.batchId;

      playBatchCompletedFanfare(settings.soundEnabled);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {
        // ignore
      }

      // Record transaction in ledger
      const newTx: Transaction = {
        id: `tx-batch-${Date.now()}`,
        type: 'batch_revenue',
        amount: totalBatchEarned,
        timestamp: Date.now(),
        description: `Batch #${completedBatchId} (10/10 Impressions Verified)`,
        batchNumber: completedBatchId,
        impressions: 10,
        status: 'completed',
        referenceCode: `BAT-10-${String(completedBatchId).padStart(3, '0')}`,
      };

      setTransactions(prev => [newTx, ...prev]);

      setProfile(prev => ({
        ...prev,
        totalBatchesCompleted: prev.totalBatchesCompleted + 1,
      }));

      setToastMessage({
        title: `Batch #${completedBatchId} Completed!`,
        subtitle: `+$${totalBatchEarned.toFixed(4)} credited to ${profile.accountEmail}`,
      });

      if (settings.autoContinueNextBatch) {
        // Intermission of 2 seconds, then start next batch
        setBatchProgress(prev => ({
          ...prev,
          completedInCurrentBatch: 10,
          batchEarned: totalBatchEarned,
          progressPercent: 100,
          secondsLeft: 0,
          status: 'intermission',
        }));

        if (intermissionTimeoutRef.current) clearTimeout(intermissionTimeoutRef.current);

        intermissionTimeoutRef.current = window.setTimeout(() => {
          const nextBatchId = completedBatchId + 1;
          const dur = getAdDurationSec(settings.durationMode);
          elapsedMsRef.current = 0;
          setBatchProgress({
            batchId: nextBatchId,
            currentAdIndex: 0,
            totalAdsInBatch: 10,
            isPlaying: true,
            isPaused: false,
            secondsLeft: dur,
            totalDuration: dur,
            progressPercent: 0,
            batchEarned: 0,
            completedInCurrentBatch: 0,
            status: 'playing',
          });
        }, settings.breakBetweenBatchesSec * 1000);
      } else {
        // Finished and halted
        setBatchProgress(prev => ({
          ...prev,
          completedInCurrentBatch: 10,
          batchEarned: totalBatchEarned,
          progressPercent: 100,
          secondsLeft: 0,
          isPlaying: false,
          status: 'batch_completed',
        }));
      }
    }
  }, [
    batchProgress.currentAdIndex, 
    batchProgress.totalAdsInBatch, 
    batchProgress.batchEarned, 
    batchProgress.batchId, 
    getAdDurationSec, 
    profile.accountEmail, 
    settings.durationMode, 
    settings.soundEnabled, 
    settings.autoContinueNextBatch, 
    settings.breakBetweenBatchesSec
  ]);

  // Main Autoplay Timer Loop
  useEffect(() => {
    const isPlaybackBlocked = settings.complianceGuard && isTabHidden;

    if (!batchProgress.isPlaying || batchProgress.status !== 'playing' || isPlaybackBlocked) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const durationSec = getAdDurationSec(settings.durationMode);
    const totalMs = durationSec * 1000;
    const intervalTickMs = 100;

    timerRef.current = window.setInterval(() => {
      elapsedMsRef.current += intervalTickMs;
      const currentElapsed = elapsedMsRef.current;
      const percent = Math.min(100, (currentElapsed / totalMs) * 100);
      const remainingSec = Math.max(0, Math.ceil((totalMs - currentElapsed) / 1000));

      setBatchProgress(prev => ({
        ...prev,
        progressPercent: percent,
        secondsLeft: remainingSec,
      }));

      if (currentElapsed >= totalMs) {
        handleCompleteCurrentAd();
      }
    }, intervalTickMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    batchProgress.isPlaying, 
    batchProgress.status, 
    batchProgress.currentAdIndex,
    settings.complianceGuard, 
    settings.durationMode, 
    isTabHidden, 
    getAdDurationSec, 
    handleCompleteCurrentAd
  ]);

  // Control Actions
  const handleTogglePlay = () => {
    setBatchProgress(prev => {
      const nextPlaying = !prev.isPlaying;
      return {
        ...prev,
        isPlaying: nextPlaying,
        status: nextPlaying ? 'playing' : 'paused',
      };
    });
  };

  const handleSkipCurrentAd = () => {
    handleCompleteCurrentAd();
  };

  const handleRestartBatch = () => {
    const dur = getAdDurationSec(settings.durationMode);
    elapsedMsRef.current = 0;
    setBatchProgress(prev => ({
      ...prev,
      currentAdIndex: 0,
      completedInCurrentBatch: 0,
      batchEarned: 0,
      secondsLeft: dur,
      totalDuration: dur,
      progressPercent: 0,
      isPlaying: true,
      status: 'playing',
    }));
  };

  const handleStartNewBatch = () => {
    const dur = getAdDurationSec(settings.durationMode);
    elapsedMsRef.current = 0;
    setBatchProgress(prev => ({
      batchId: prev.batchId + 1,
      currentAdIndex: 0,
      totalAdsInBatch: 10,
      completedInCurrentBatch: 0,
      batchEarned: 0,
      secondsLeft: dur,
      totalDuration: dur,
      progressPercent: 0,
      isPlaying: true,
      isPaused: false,
      status: 'playing',
    }));
  };

  const handleSelectAdIndex = (index: number) => {
    const dur = getAdDurationSec(settings.durationMode);
    elapsedMsRef.current = 0;
    setBatchProgress(prev => ({
      ...prev,
      currentAdIndex: index,
      secondsLeft: dur,
      totalDuration: dur,
      progressPercent: 0,
      isPlaying: true,
      status: 'playing',
    }));
  };

  const handleUpdateEmail = (newEmail: string) => {
    setProfile(prev => ({
      ...prev,
      accountEmail: newEmail,
      payoutAddress: newEmail,
    }));
    setToastMessage({
      title: 'Target Account Updated',
      subtitle: `Ad revenues will route to ${newEmail}`,
    });
  };

  const handleRequestPayout = (amount: number, method: string, address: string) => {
    setProfile(prev => ({
      ...prev,
      currentBalance: Math.max(0, prev.currentBalance - amount),
      totalPayoutsProcessed: prev.totalPayoutsProcessed + 1,
    }));

    const payoutTx: Transaction = {
      id: `tx-payout-${Date.now()}`,
      type: 'payout',
      amount: amount,
      timestamp: Date.now(),
      description: `Disbursed to ${address} via ${method}`,
      status: 'completed',
      referenceCode: `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    setTransactions(prev => [payoutTx, ...prev]);
  };

  const handleUpdateSettings = (newSettings: Partial<BatchSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.durationMode && newSettings.durationMode !== prev.durationMode) {
        const newDur = getAdDurationSec(newSettings.durationMode);
        elapsedMsRef.current = 0;
        setBatchProgress(b => ({
          ...b,
          secondsLeft: newDur,
          totalDuration: newDur,
          progressPercent: 0,
        }));
      }
      return updated;
    });
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Navigation */}
      <Navbar
        currentBalance={profile.currentBalance}
        accountEmail={profile.accountEmail}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        batchCount={profile.totalBatchesCompleted}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className={`border rounded-2xl p-4 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border-blue-500/40 text-white' 
              : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 text-slate-900 shadow-slate-200/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-500">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">{toastMessage.title}</h4>
                <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>{toastMessage.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
              }`}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary Stage Grid: Ad Video Player + Batch Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Ad Player Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AdPlayer
              ad={currentAd}
              batchProgress={batchProgress}
              onTogglePlay={handleTogglePlay}
              onSkipAd={handleSkipCurrentAd}
              soundEnabled={settings.soundEnabled}
              onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              isTabHidden={isTabHidden}
              complianceGuard={settings.complianceGuard}
              accountEmail={profile.accountEmail}
              theme={theme}
            />

            {/* Batch Controller (10-ad step bar & pacing controls) */}
            <BatchController
              batchProgress={batchProgress}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRestartBatch={handleRestartBatch}
              onStartNewBatch={handleStartNewBatch}
              onSelectAdIndex={handleSelectAdIndex}
              theme={theme}
            />
          </div>

          {/* Account Overview & Compliance Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Publisher Account & Financial Dashboard */}
            <AccountDashboard
              profile={profile}
              transactions={transactions}
              onUpdateEmail={handleUpdateEmail}
              onRequestPayout={handleRequestPayout}
              theme={theme}
            />

            {/* Compliance Advisor & Anti-Fraud Guide */}
            <ComplianceAdvisor
              complianceGuard={settings.complianceGuard}
              onToggleComplianceGuard={(val) => handleUpdateSettings({ complianceGuard: val })}
              isTabHidden={isTabHidden}
              score={settings.complianceGuard ? 98 : 72}
              theme={theme}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors duration-200 ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            Ad Revenue Batch Autoplayer • Running in 10-Ad Continuous Cycle Mode
          </div>
          <div className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Publisher: {profile.publisherId} • Target: {profile.accountEmail}
          </div>
        </div>
      </footer>
    </div>
  );
}
