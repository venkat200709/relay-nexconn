import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { RequestFeed } from './components/RequestFeed';
import { ChatRoom } from './components/ChatRoom';
import { ResolvedArchive } from './components/ResolvedArchive';
import { RoleSelector } from './components/RoleSelector';
import { CreateRequestModal } from './components/CreateRequestModal';
import {
  ListFilter,
  MessageSquare,
  Archive,
  PlusCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export function App() {
  const { activeRequestId, setActiveRequestId, currentUser } = useApp();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'archive'>('feed');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white text-[11px] sm:text-xs py-1.5 px-4 font-semibold text-center flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>
          <strong>Nexconn Build Challenge 2026</strong> • Team Hexcore (Venkatesan & Sasmita) • Open Innovation Track
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div
          className={`w-full md:w-[420px] lg:w-[480px] h-full flex flex-col border-r border-slate-200 dark:border-slate-800 transition-all ${
            activeTab === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'feed'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Live Requests</span>
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'archive'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Resolved Archive</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'feed' ? (
              <RequestFeed onOpenCreateModal={() => setIsCreateModalOpen(true)} />
            ) : (
              <ResolvedArchive />
            )}
          </div>
        </div>

        <div
          className={`flex-1 h-full flex flex-col bg-white dark:bg-slate-900 transition-all ${
            activeTab !== 'chat' && !activeRequestId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ChatRoom
            onBack={() => {
              setActiveRequestId(null);
              setActiveTab('feed');
            }}
          />
        </div>
      </div>

      <div className="md:hidden flex items-center justify-around py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-20">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'feed'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ListFilter className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
        >
          <div className="p-1 rounded-full bg-indigo-600 text-white shadow-md">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span>Post</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold relative ${
            activeTab === 'chat'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
          {activeRequestId && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'archive'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Archive className="w-5 h-5" />
          <span>Archive</span>
        </button>
      </div>

      <RoleSelector
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default App;
