import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Star, Calendar, User, Heart, MessageSquare } from 'lucide-react';

export const ResolvedArchive: React.FC = () => {
  const { requests, setActiveRequestId } = useApp();
  const resolvedList = requests.filter((r) => r.status === 'resolved');

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          Resolved Neighbourhood Help Archive
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {resolvedList.length} completed community dispatches with verified outcomes
        </p>
      </div>

      {resolvedList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            No resolved requests yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Once a volunteer claims and resolves an active request, its summary and feedback will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {resolvedList.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {item.category}
                </span>

                {item.rating && (
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating}.0 / 5.0</span>
                  </div>
                )}
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                {item.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {item.description}
              </p>

              {item.resolutionSummary && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-3">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    Resolution Outcome:
                  </span>
                  {item.resolutionSummary}
                </div>
              )}

              {item.feedback && (
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 italic mb-3 flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>"{item.feedback}"</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Requester: {item.requesterName}
                  </span>
                  {item.volunteerName && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        Volunteer: {item.volunteerName}
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setActiveRequestId(item.id)}
                  className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>View Room</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
