import React from 'react';
import { RequestStatus } from '../types';
import { Clock, CheckCircle2, PlayCircle, ShieldCheck } from 'lucide-react';

interface StatusBannerProps {
  status: RequestStatus;
  canAdvance: boolean;
  onAdvance: () => void;
  advanceLabel?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  status,
  canAdvance,
  onAdvance,
  advanceLabel,
}) => {
  const steps: { key: RequestStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'open', label: 'Open', icon: <Clock className="w-4 h-4" /> },
    { key: 'claimed', label: 'Claimed', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'in_progress', label: 'In Progress', icon: <PlayCircle className="w-4 h-4" /> },
    { key: 'resolved', label: 'Resolved', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const getStepIndex = (s: RequestStatus) => {
    switch (s) {
      case 'open': return 0;
      case 'claimed': return 1;
      case 'in_progress': return 2;
      case 'resolved': return 3;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full bg-slate-900 text-white px-4 py-3 border-b border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <React.Fragment key={step.key}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/30'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-white'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-6 sm:w-10 h-0.5 transition-colors ${
                      idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {canAdvance && advanceLabel && (
          <button
            onClick={onAdvance}
            className="self-end sm:self-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-1.5 active:scale-95"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            {advanceLabel}
          </button>
        )}
      </div>
    </div>
  );
};
