import React, { useState } from 'react';
import { AdCreative, SurveyAnswers, ThemeMode } from '../types';
import { DollarSign, CheckCircle2, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface SurveyStepProps {
  ad: AdCreative;
  rewardAmount: number;
  accountEmail: string;
  theme?: ThemeMode;
  onSubmitSurvey: (answers: SurveyAnswers) => void;
}

const QUESTIONS = [
  {
    id: 'question1' as const,
    prompt: '1. How did you find this ad?',
    options: [
      'Very Engaging',
      'Informative',
      'Neutral',
      'Not Interesting',
    ],
  },
  {
    id: 'question2' as const,
    prompt: '2. Would you buy this product?',
    options: [
      'Definitely',
      'Likely',
      'Unlikely',
      'Never',
    ],
  },
  {
    id: 'question3' as const,
    prompt: '3. How relevant was it to you?',
    options: [
      'Highly Relevant',
      'Somewhat Relevant',
      'Not Relevant',
    ],
  },
];

export const SurveyStep: React.FC<SurveyStepProps> = ({
  ad,
  rewardAmount,
  accountEmail,
  theme = 'dark',
  onSubmitSurvey,
}) => {
  const isDark = theme === 'dark';

  const [answers, setAnswers] = useState<{
    question1: string;
    question2: string;
    question3: string;
  }>({
    question1: '',
    question2: '',
    question3: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredCount = [answers.question1, answers.question2, answers.question3].filter(Boolean).length;
  const isAllAnswered = Boolean(answers.question1 && answers.question2 && answers.question3);

  const handleSelectOption = (questionKey: keyof typeof answers, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: option,
    }));
  };

  const handleClaimReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered || isSubmitting) return;

    setIsSubmitting(true);
    onSubmitSurvey({
      question1: answers.question1,
      question2: answers.question2,
      question3: answers.question3,
    });
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 border relative ${
        isDark
          ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-2xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
    >
      {/* Top Banner Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <HelpCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                Ad Completed • Step 2 of 2
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {answeredCount}/3 Answered
              </span>
            </div>
            <h3 className={`text-base sm:text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Viewer Survey: {ad.brand}
            </h3>
          </div>
        </div>

        {/* Pending Reward Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Reward: +${rewardAmount.toFixed(4)}</span>
        </div>
      </div>

      <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Answer all 3 quick questions below to verify human attention and immediately credit{' '}
        <strong className="text-emerald-500 font-semibold">+${rewardAmount.toFixed(4)}</strong> to{' '}
        <strong className="font-mono text-blue-500">{accountEmail}</strong> before the next ad starts.
      </p>

      {/* 3 Questions Grid */}
      <form onSubmit={handleClaimReward} className="space-y-4">
        {QUESTIONS.map((q) => {
          const currentVal = answers[q.id];

          return (
            <div
              key={q.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-colors ${
                isDark
                  ? currentVal
                    ? 'bg-slate-800/80 border-blue-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                  : currentVal
                  ? 'bg-blue-50/50 border-blue-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {q.prompt}
                </span>
                {currentVal && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selected
                  </span>
                )}
              </div>

              {/* Radio-style pill options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {q.options.map((option) => {
                  const isSelected = currentVal === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      id={`survey-${q.id}-${option.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleSelectOption(q.id, option)}
                      className={`px-3 py-2 text-xs rounded-lg font-medium text-center transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/30 font-semibold'
                          : isDark
                          ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Claim Reward Action Button Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isAllAnswered ? (
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <Sparkles className="w-4 h-4" />
                All 3 questions answered! Ready to credit reward.
              </span>
            ) : (
              <span>
                Please answer {3 - answeredCount} more {3 - answeredCount === 1 ? 'question' : 'questions'} to unlock
                reward
              </span>
            )}
          </div>

          <button
            id="claim-reward-button"
            type="submit"
            disabled={!isAllAnswered || isSubmitting}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              isAllAnswered && !isSubmitting
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-95 animate-pulse'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-not-allowed opacity-60'
            }`}
          >
            {isSubmitting ? (
              <span>Crediting Reward...</span>
            ) : (
              <>
                <span>Claim Reward (+${rewardAmount.toFixed(4)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
