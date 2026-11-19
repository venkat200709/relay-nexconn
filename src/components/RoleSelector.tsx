import React, { useState } from 'react';
import { useApp, PRESET_USERS } from '../context/AppContext';
import { UserProfile } from '../types';
import { X, Check, Shield, User, Sparkles } from 'lucide-react';

interface RoleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUser } = useApp();
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<'requester' | 'volunteer'>('volunteer');

  if (!isOpen) return null;

  const handleSelectPreset = async (preset: UserProfile) => {
    await switchUser(preset);
    onClose();
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const customUser: UserProfile = {
      id: `custom-${Date.now().toString(36)}`,
      name: customName.trim(),
      role: customRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customName.trim())}`,
    };

    await switchUser(customUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Demo Role Selector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click instant login for judges & multi-window testing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSelectPreset(PRESET_USERS[0])}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 hover:border-amber-400 transition-all text-left shadow-sm group"
            >
              <img
                src={PRESET_USERS[0].avatar}
                alt="Eleanor"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block tracking-wider">
                  Try as Requester
                </span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white block truncate">
                  Eleanor (Elderly)
                </span>
              </div>
            </button>

            <button
              onClick={() => handleSelectPreset(PRESET_USERS[2])}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-violet-50/40 dark:from-indigo-950/20 dark:to-violet-950/10 hover:border-indigo-400 transition-all text-left shadow-sm group"
            >
              <img
                src={PRESET_USERS[2].avatar}
                alt="Venkatesan"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block tracking-wider">
                  Try as Volunteer
                </span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white block truncate">
                  Venkatesan (Leader)
                </span>
              </div>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
              Team & Scenario Presets
            </label>
            <div className="space-y-2">
              {PRESET_USERS.map((preset) => {
                const isSelected = currentUser.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={preset.avatar}
                        alt={preset.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {preset.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              preset.role === 'volunteer' ? 'bg-violet-500' : 'bg-amber-500'
                            }`}
                          />
                          <span className="capitalize">{preset.role}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleCreateCustom} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Or Enter Custom Persona
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Alex Rivera)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="requester">Requester</option>
                <option value="volunteer">Volunteer</option>
              </select>
              <button
                type="submit"
                disabled={!customName.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
