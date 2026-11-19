import React from 'react';
import { useApp } from '../context/AppContext';
import { Radio, Moon, Sun, Type, RotateCcw, UserCheck, ShieldAlert, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  onOpenRoleModal: () => void;
  onOpenCreateModal: () => void;
  activeTab: 'feed' | 'chat' | 'archive';
  setActiveTab: (tab: 'feed' | 'chat' | 'archive') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRoleModal,
  onOpenCreateModal,
  activeTab,
  setActiveTab,
}) => {
  const {
    currentUser,
    connectionStatus,
    isDarkMode,
    toggleDarkMode,
    isLargeFont,
    toggleLargeFont,
    resetDemoData,
    activeRequest,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Relay
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Open Innovation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Dispatch-first chat for neighbourhood help
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="relative flex h-2 w-2">
              {connectionStatus === 'CONNECTED' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : connectionStatus === 'CONNECTING' ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {connectionStatus === 'CONNECTED'
                ? 'Nexconn Live'
                : connectionStatus === 'CONNECTING'
                ? 'Connecting SDK...'
                : 'Offline'}
            </span>
          </div>

          <button
            onClick={onOpenRoleModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all text-xs font-semibold shadow-sm"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-500"
            />
            <span className="max-w-[90px] sm:max-w-[120px] truncate">{currentUser.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                currentUser.role === 'volunteer'
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {currentUser.role}
            </span>
          </button>

          <button
            onClick={toggleLargeFont}
            title={isLargeFont ? 'Normal font' : 'Large accessibility font'}
            className={`p-2 rounded-xl border transition-colors ${
              isLargeFont
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={resetDemoData}
            title="Reset demo data (for judges)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
