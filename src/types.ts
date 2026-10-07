export type AdCategory = 'Tech & Cloud' | 'FinTech & Banking' | 'Gaming & Esports' | 'Auto & EV' | 'Health & Fitness' | 'E-Commerce';
export type AdFormat = 'Rewarded Video' | 'Interstitial' | 'Bumper' | 'In-Stream';
export type ThemeMode = 'dark' | 'light';

export interface AdCreative {
  id: string;
  brand: string;
  sponsorTag: string;
  headline: string;
  description: string;
  category: AdCategory;
  format: AdFormat;
  cpm: number; // e.g. $14.50 eCPM -> $0.0145 per completed impression
  accentColor: string;
  bgGradient: string;
  iconName: string;
  visualTheme: 'server' | 'crypto' | 'car' | 'game' | 'fitness' | 'shopping' | 'ai';
  ctaText: string;
  ctaUrl: string;
  rating?: number;
  installCount?: string;
}

export type DurationMode = 'speed_5s' | 'standard_10s' | 'full_15s';

export interface BatchSettings {
  batchSize: number; // default 10
  durationMode: DurationMode;
  autoContinueNextBatch: boolean;
  soundEnabled: boolean;
  complianceGuard: boolean; // enforces active tab viewability
  breakBetweenBatchesSec: number;
}

export interface BatchProgress {
  batchId: number;
  currentAdIndex: number; // 0 to 9 (corresponds to Ad 1 to 10)
  totalAdsInBatch: number; // 10
  isPlaying: boolean;
  isPaused: boolean;
  secondsLeft: number;
  totalDuration: number;
  progressPercent: number; // 0 - 100
  batchEarned: number;
  completedInCurrentBatch: number;
  status: 'idle' | 'playing' | 'paused' | 'batch_completed' | 'intermission';
}

export interface AccountProfile {
  accountEmail: string;
  publisherId: string;
  payoutMethod: 'PayPal' | 'Bank Transfer (ACH)' | 'Stripe' | 'USDC Crypto';
  payoutAddress: string;
  lifetimeEarnings: number;
  currentBalance: number;
  totalBatchesCompleted: number;
  totalImpressionsVerified: number;
  totalPayoutsProcessed: number;
  averageECPM: number;
}

export interface Transaction {
  id: string;
  type: 'batch_revenue' | 'payout' | 'bonus';
  amount: number;
  timestamp: number;
  description: string;
  batchNumber?: number;
  impressions?: number;
  status: 'completed' | 'processing';
  referenceCode: string;
}

export interface AdBeaconLog {
  id: string;
  time: string;
  event: 'START' | 'FIRST_QUARTILE' | 'MIDPOINT' | 'THIRD_QUARTILE' | 'COMPLETE' | 'CREDITED';
  adTitle: string;
  adNumberInBatch: number;
  revenueDelta: number;
  status: 'verified' | 'pending';
}
