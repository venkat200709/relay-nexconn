import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RequestCategory, UrgencyLevel } from '../types';
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../lib/speech';
import {
  X,
  Mic,
  MicOff,
  MapPin,
  Sparkles,
  AlertCircle,
  Pill,
  ShoppingBag,
  Car,
  Languages,
  HeartHandshake,
  Wrench,
  Dog,
  ShieldAlert,
} from 'lucide-react';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ isOpen, onClose }) => {
  const { createRequest, currentUser } = useApp();
  const [category, setCategory] = useState<RequestCategory>('Medicine');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recognitionStopper, setRecognitionStopper] = useState<{ stop: () => void } | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionStopper) {
        recognitionStopper.stop();
      }
    };
  }, [recognitionStopper]);

  if (!isOpen) return null;

  const categories: { key: RequestCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'Medicine', label: 'Medicine Run', icon: <Pill className="w-4 h-4" /> },
    { key: 'Groceries', label: 'Groceries / Food', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'Ride', label: 'Ride / Transport', icon: <Car className="w-4 h-4" /> },
    { key: 'Translation', label: 'Translation Help', icon: <Languages className="w-4 h-4" /> },
    { key: 'Elder Check-in', label: 'Elder Check-in', icon: <HeartHandshake className="w-4 h-4" /> },
    { key: 'Household Fix', label: 'Household Fix', icon: <Wrench className="w-4 h-4" /> },
    { key: 'Pet Care', label: 'Pet Care', icon: <Dog className="w-4 h-4" /> },
    { key: 'Urgent Alert', label: 'Urgent Alert', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const handleToggleSpeech = () => {
    if (isRecording) {
      if (recognitionStopper) recognitionStopper.stop();
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    const stopper = startSpeechRecognition({
      onResult: (text) => {
        setDescription((prev) => (prev ? `${prev} ${text}` : text));
      },
      onError: (err) => {
        setSpeechError(err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (stopper) {
      setRecognitionStopper(stopper);
      setIsRecording(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const ok = await createRequest({
      category,
      urgency,
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || 'Neighbourhood Area',
    });
    setIsSubmitting(false);

    if (ok) {
      setTitle('');
      setDescription('');
      setLocation('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Post a Community Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Posting as <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Need Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-semibold transition-all text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                      {cat.icon}
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('high')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === 'high'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 shadow-sm ring-1 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                High Urgency
              </button>
              <button
                type="button"
                onClick={() => setUrgency('medium')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === 'medium'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 shadow-sm ring-1 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === 'normal'
                    ? 'border-slate-700 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-sm ring-1 ring-slate-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Normal
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Request Title
            </label>
            <input
              type="text"
              placeholder="e.g. Need urgent pickup of asthma inhaler from pharmacy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Details & Instructions
              </label>
              {isSpeechRecognitionSupported() && (
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isRecording
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Listening...' : 'Dictate with Voice'}</span>
                </button>
              )}
            </div>

            <textarea
              rows={3}
              placeholder="Describe what you need, timing, any access codes, or specific instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
            {speechError && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {speechError}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Location / Neighbourhood (Optional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Maple Heights, Block 4B, Apt 201"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Open Dispatch Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
