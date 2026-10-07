import React, { useState, useMemo } from 'react';
import { AccountProfile, Transaction, ThemeMode } from '../types';
import { 
  Wallet, DollarSign, CheckCircle2, 
  Send, CreditCard, Building, Coins, Download, Edit3, LineChart as ChartIcon
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';

interface AccountDashboardProps {
  profile: AccountProfile;
  transactions: Transaction[];
  onUpdateEmail: (email: string) => void;
  onRequestPayout: (amount: number, method: string, address: string) => void;
  theme?: ThemeMode;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  profile,
  transactions,
  onUpdateEmail,
  onRequestPayout,
  theme = 'dark',
}) => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(profile.accountEmail);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'PayPal' | 'Bank Transfer (ACH)' | 'Stripe' | 'USDC Crypto'>(profile.payoutMethod);
  const [payoutAddress, setPayoutAddress] = useState(profile.accountEmail);
  const [payoutAmount, setPayoutAmount] = useState(profile.currentBalance > 0 ? profile.currentBalance.toFixed(2) : '10.00');
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Compute cumulative earnings timeline for chart
  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    let runningCumulative = 0;

    return sorted.map((tx) => {
      const delta = tx.type === 'payout' ? -tx.amount : tx.amount;
      runningCumulative += delta;

      return {
        id: tx.id,
        time: new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rawTime: tx.timestamp,
        amount: tx.amount,
        balance: parseFloat(Math.max(0, runningCumulative).toFixed(4)),
        type: tx.type === 'batch_revenue' ? 'Batch Revenue' : tx.type === 'payout' ? 'Payout' : 'Grant/Bonus',
        label: tx.batchNumber ? `Batch #${tx.batchNumber}` : tx.referenceCode,
      };
    });
  }, [transactions]);

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempEmail.trim()) {
      onUpdateEmail(tempEmail.trim());
      setIsEditingEmail(false);
    }
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) return;

    onRequestPayout(amt, payoutMethod, payoutAddress);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setPayoutSuccess(`Payout of $${amt.toFixed(2)} dispatched to ${payoutAddress} via ${payoutMethod}`);
    setTimeout(() => {
      setPayoutSuccess(null);
      setShowPayoutModal(false);
    }, 2000);
  };

  const handleExportLedger = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ad-revenue-ledger-${profile.accountEmail}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={`rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-xl border transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-900/90 border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      {/* Account Info Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-5 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Publisher Account
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-md">
                Active & Earning
              </span>
            </div>

            {isEditingEmail ? (
              <form onSubmit={handleSaveEmail} className="flex items-center gap-2 mt-1">
                <input
                  id="target-account-email-input"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-mono focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className={`px-2 py-1 text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Target Account: <strong className="text-emerald-500 font-semibold">{profile.accountEmail}</strong>
                </span>
                <button
                  id="edit-account-email-btn"
                  onClick={() => {
                    setTempEmail(profile.accountEmail);
                    setIsEditingEmail(true);
                  }}
                  className={`p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  title="Change destination account email"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payout Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            id="request-payout-modal-btn"
            onClick={() => {
              setPayoutAmount(profile.currentBalance.toFixed(2));
              setShowPayoutModal(true);
            }}
            disabled={profile.currentBalance <= 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-5">
        {/* Available Balance */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden ${
          isDark ? 'bg-slate-950/60 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Available Balance
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500">
            ${profile.currentBalance.toFixed(4)}
          </div>
          <div className={`text-[11px] mt-1 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Ready for payout</span>
          </div>
        </div>

        {/* Lifetime Revenue */}
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-slate-950/60 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Lifetime Revenue
          </div>
          <div className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ${profile.lifetimeEarnings.toFixed(4)}
          </div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Total generated to account
          </div>
        </div>

        {/* Total Batches Finished */}
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-slate-950/60 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Batches of 10 Completed
          </div>
          <div className="text-2xl font-bold font-mono text-blue-500">
            {profile.totalBatchesCompleted}
          </div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {profile.totalImpressionsVerified} verified impressions
          </div>
        </div>

        {/* Average eCPM */}
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-slate-950/60 border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Effective eCPM
          </div>
          <div className="text-2xl font-bold font-mono text-purple-500">
            ${profile.averageECPM.toFixed(2)}
          </div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Avg per 1,000 impressions
          </div>
        </div>
      </div>

      {/* Earnings Over Time Line Chart */}
      <div className={`my-5 p-4 sm:p-5 rounded-2xl border ${
        isDark ? 'bg-slate-950/60 border-slate-800/90' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Earnings Over Time
              </h4>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Cumulative balance accrual across 10-ad batch completions
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            ${profile.currentBalance.toFixed(4)}
          </span>
        </div>

        <div className="h-44 w-full pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke={isDark ? '#64748b' : '#475569'} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }} 
                />
                <YAxis 
                  stroke={isDark ? '#64748b' : '#475569'} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className={`border rounded-xl p-3 shadow-xl text-xs space-y-1 ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}>
                          <div className="font-semibold">{data.label}</div>
                          <div className={`font-mono text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.time}</div>
                          <div className="text-emerald-500 font-mono font-bold">
                            Balance: ${data.balance.toFixed(4)}
                          </div>
                          <div className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {data.type}: {data.amount >= 0 ? `+$${data.amount.toFixed(4)}` : `-$${Math.abs(data.amount).toFixed(4)}`}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: isDark ? '#022c22' : '#d1fae5' }} 
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#064e3b', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-full flex items-center justify-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No transactions recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Transaction & Audit Ledger */}
      <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ledger & Verified Batches
          </h4>
          <button
            id="export-ledger-btn"
            onClick={handleExportLedger}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
              isDark 
                ? 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700' 
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        {/* Table of Ledger Transactions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Batch / Reference</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {transactions.slice(0, 6).map((tx) => (
                <tr key={tx.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      tx.type === 'batch_revenue' ? 'text-emerald-500' : tx.type === 'payout' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {tx.type === 'batch_revenue' ? 'Batch Revenue' : tx.type === 'payout' ? 'Payout Sent' : 'Bonus'}
                    </span>
                  </td>
                  <td className={`py-2.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tx.batchNumber ? `Batch #${tx.batchNumber} (10 Ads)` : tx.referenceCode}
                  </td>
                  <td className={`py-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {tx.status}
                    </span>
                  </td>
                  <td className={`py-2.5 font-mono font-semibold text-right ${
                    tx.type === 'payout' ? (isDark ? 'text-slate-300' : 'text-slate-700') : 'text-emerald-500'
                  }`}>
                    {tx.type === 'payout' ? `-$${tx.amount.toFixed(4)}` : `+$${tx.amount.toFixed(4)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Disburse Revenue Payout
            </h3>
            <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Disburse verified ad revenues to your chosen destination account.
            </p>

            {payoutSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center my-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-bold text-emerald-500">{payoutSuccess}</div>
                <div className="text-xs text-emerald-500/80 mt-1">Transaction confirmed & balance updated.</div>
              </div>
            ) : (
              <form onSubmit={handlePayoutSubmit} className="space-y-4">
                {/* Method selector */}
                <div>
                  <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Payout Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'PayPal', icon: <DollarSign className="w-3.5 h-3.5" /> },
                      { id: 'Stripe', icon: <CreditCard className="w-3.5 h-3.5" /> },
                      { id: 'Bank Transfer (ACH)', icon: <Building className="w-3.5 h-3.5" /> },
                      { id: 'USDC Crypto', icon: <Coins className="w-3.5 h-3.5" /> },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayoutMethod(m.id as typeof payoutMethod)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          payoutMethod === m.id
                            ? 'bg-blue-600/20 border-blue-500 text-blue-500 font-semibold'
                            : isDark
                              ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {m.icon}
                        <span className="truncate">{m.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination address */}
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Destination Account ({payoutMethod === 'USDC Crypto' ? 'Wallet Address' : 'Email / Account ID'})
                  </label>
                  <input
                    id="payout-address-input"
                    type="text"
                    value={payoutAddress}
                    onChange={(e) => setPayoutAddress(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="famwraps@gmail.com"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Amount (USD)
                    </label>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Available: <strong className="text-emerald-500 font-mono">${profile.currentBalance.toFixed(4)}</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      id="payout-amount-input"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={profile.currentBalance}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className={`w-full pl-6 pr-3 py-2 text-xs rounded-xl border font-mono focus:outline-none focus:border-blue-500 ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/30"
                  >
                    Confirm & Disburse Funds
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
