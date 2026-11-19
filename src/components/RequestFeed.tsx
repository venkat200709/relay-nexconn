import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RequestCard } from './RequestCard';
import { Search, PlusCircle, AlertCircle, Filter, Sparkles, Inbox } from 'lucide-react';

interface RequestFeedProps {
  onOpenCreateModal: () => void;
}

export const RequestFeed: React.FC<RequestFeedProps> = ({ onOpenCreateModal }) => {
  const { requests, activeRequestId, setActiveRequestId, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'active'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'Medicine',
    'Groceries',
    'Ride',
    'Translation',
    'Elder Check-in',
    'Household Fix',
  ];

  const filteredRequests = requests.filter((req) => {
    if (filterType === 'urgent' && req.urgency !== 'high') return false;
    if (filterType === 'active' && req.status === 'open') return false;
    if (filterType === 'all' && req.status === 'resolved') return false;

    if (selectedCategory !== 'all' && req.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description.toLowerCase().includes(q);
      const matchLoc = req.location.toLowerCase().includes(q);
      const matchCat = req.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc || matchCat;
    }

    return true;
  });

  const openCount = requests.filter((r) => r.status === 'open').length;
  const urgentCount = requests.filter((r) => r.status === 'open' && r.urgency === 'high').length;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Community Dispatch Feed
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                {openCount} Open
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live requests from verified neighbours in need
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Request</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search needs, groceries, pharmacy, street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Open ({openCount})
          </button>
          <button
            onClick={() => setFilterType('urgent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'urgent'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            High Urgency ({urgentCount})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'active'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Claimed / Active
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3 border border-slate-200 dark:border-slate-700">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              No requests found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {searchQuery
                ? 'Try searching with different terms or clearing your search.'
                : 'All neighbourhood requests in this filter are currently completed! Post a new request anytime.'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              isSelected={activeRequestId === req.id}
              onSelect={() => setActiveRequestId(req.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
