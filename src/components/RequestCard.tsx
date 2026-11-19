import React from 'react';
import { HelpRequest } from '../types';
import { useApp } from '../context/AppContext';
import {
  Pill,
  ShoppingBag,
  Car,
  Languages,
  HeartHandshake,
  Wrench,
  Dog,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface RequestCardProps {
  request: HelpRequest;
  onSelect: () => void;
  isSelected?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onSelect, isSelected }) => {
  const { currentUser, claimRequest } = useApp();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Medicine': return <Pill className="w-3.5 h-3.5" />;
      case 'Groceries': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Ride': return <Car className="w-3.5 h-3.5" />;
      case 'Translation': return <Languages className="w-3.5 h-3.5" />;
      case 'Elder Check-in': return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'Household Fix': return <Wrench className="w-3.5 h-3.5" />;
      case 'Pet Care': return <Dog className="w-3.5 h-3.5" />;
      default: return <AlertTriangle className="w-3.5 h-3.5" />;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse-fast" />
            Urgent
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Normal
          </span>
        );
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await claimRequest(request.id);
  };

  return (
    <div
      onClick={onSelect}
      className={`relative p-5 rounded-3xl border transition-all cursor-pointer group ${
        isSelected
          ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800">
            {getCategoryIcon(request.category)}
            {request.category}
          </span>
          {getUrgencyBadge(request.urgency)}
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {formatRelativeTime(request.createdAt)}
        </div>
      </div>

      <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
        {request.title}
      </h4>

      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
        {request.description}
      </p>

      {request.location && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl w-fit max-w-full truncate border border-slate-100 dark:border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">{request.location}</span>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={request.requesterAvatar}
            alt={request.requesterName}
            className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
            {request.requesterName}
          </span>
        </div>

        {request.status === 'open' && currentUser.role === 'volunteer' ? (
          <button
            onClick={handleClaim}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 active:scale-95"
          >
            <span>Claim & Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : request.status === 'open' ? (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Waiting for volunteer
          </span>
        ) : request.status === 'resolved' ? (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Resolved
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>In Dispatch Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
