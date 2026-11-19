import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBanner } from './StatusBanner';
import { RatingModal } from './RatingModal';
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../lib/speech';
import {
  Send,
  Image,
  Mic,
  MicOff,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCheck,
  Check,
  ShieldCheck,
  Sparkles,
  Paperclip,
  X,
  Heart,
} from 'lucide-react';

interface ChatRoomProps {
  onBack?: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ onBack }) => {
  const {
    activeRequest,
    currentUser,
    messages,
    sendMessage,
    notifyTyping,
    isOtherUserTyping,
    updateRequestStatus,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [resolutionInput, setResolutionInput] = useState('');
  const [isResolvingPrompt, setIsResolvingPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const quickChips = [
    'On my way now',
    'Arrived outside your location',
    'Need a quick clarification',
    'Almost finished',
    'Package safely delivered',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherUserTyping]);

  if (!activeRequest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-950/50">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
          No active dispatch room selected
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Select a request from the feed or claim an open need to open a dedicated real-time Nexconn chat room.
        </p>
      </div>
    );
  }

  const peer =
    currentUser.role === 'volunteer'
      ? {
          id: activeRequest.requesterId,
          name: activeRequest.requesterName,
          avatar: activeRequest.requesterAvatar,
          role: 'Requester',
        }
      : {
          id: activeRequest.volunteerId || 'unassigned',
          name: activeRequest.volunteerName || 'Awaiting Volunteer',
          avatar:
            activeRequest.volunteerAvatar ||
            'https://api.dicebear.com/7.x/bottts/svg?seed=volunteer',
          role: 'Volunteer',
        };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    notifyTyping();
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !selectedImage) return;

    const textToSend = inputMessage.trim();
    const imageToSend = selectedImage || undefined;

    setInputMessage('');
    setSelectedImage(null);

    await sendMessage(textToSend, imageToSend);
  };

  const handleQuickChip = async (chipText: string) => {
    await sendMessage(chipText);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSpeech = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    startSpeechRecognition({
      onResult: (text) => {
        setInputMessage((prev) => (prev ? `${prev} ${text}` : text));
        notifyTyping();
      },
      onError: () => setIsRecording(false),
      onEnd: () => setIsRecording(false),
    });
    setIsRecording(true);
  };

  const handleAdvanceStatus = async () => {
    if (activeRequest.status === 'claimed') {
      await updateRequestStatus(activeRequest.id, 'in_progress');
    } else if (activeRequest.status === 'in_progress') {
      setIsResolvingPrompt(true);
    }
  };

  const handleConfirmResolution = async () => {
    await updateRequestStatus(
      activeRequest.id,
      'resolved',
      resolutionInput.trim() || 'Request successfully completed by volunteer.'
    );
    setIsResolvingPrompt(false);
    setResolutionInput('');
    if (currentUser.role === 'requester') {
      setIsRatingModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="relative">
              <img
                src={peer.avatar}
                alt={peer.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {peer.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                  {peer.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {activeRequest.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeRequest.status === 'resolved' && currentUser.role === 'requester' && !activeRequest.rating && (
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Rate & Thank</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <StatusBanner
        status={activeRequest.status}
        canAdvance={
          (activeRequest.status === 'claimed' && currentUser.role === 'volunteer') ||
          activeRequest.status === 'in_progress'
        }
        advanceLabel={
          activeRequest.status === 'claimed'
            ? 'Start Task'
            : activeRequest.status === 'in_progress'
            ? 'Mark Resolved'
            : undefined
        }
        onAdvance={handleAdvanceStatus}
      />

      {isResolvingPrompt && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border-b border-indigo-200 dark:border-indigo-900/60 space-y-2 animate-fade-in">
          <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">
            Resolution Summary (Outcome)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Inhaler delivered to Eleanor at Apt 402."
              value={resolutionInput}
              onChange={(e) => setResolutionInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleConfirmResolution}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Confirm Resolved
            </button>
            <button
              onClick={() => setIsResolvingPrompt(false)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {activeRequest.category}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeRequest.title}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
            {activeRequest.description}
          </p>
          {activeRequest.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>{activeRequest.location}</span>
            </div>
          )}
        </div>

        {messages.map((msg) => {
          if (msg.isStatusAlert) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
            >
              {!msg.isSelf && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-slate-700"
                />
              )}

              <div
                className={`max-w-[78%] sm:max-w-[68%] rounded-3xl p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed ${
                  msg.isSelf
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-bl-none'
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="attachment"
                    className="rounded-2xl max-h-60 w-auto object-cover mb-2 border border-black/10"
                  />
                )}
                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                    msg.isSelf ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.isSelf && <CheckCheck className="w-3 h-3 text-indigo-300" />}
                </div>
              </div>
            </div>
          );
        })}

        {isOtherUserTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 py-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>{peer.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none flex items-center gap-2">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickChip(chip)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {selectedImage && (
        <div className="px-4 pt-2 bg-white dark:bg-slate-900 flex items-center gap-2">
          <div className="relative">
            <img
              src={selectedImage}
              alt="preview"
              className="w-16 h-16 rounded-xl object-cover border border-indigo-500"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-rose-500 text-white shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-slate-500">Image attached. Press send.</span>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
          className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <Image className="w-5 h-5" />
        </button>

        {isSpeechRecognitionSupported() && (
          <button
            type="button"
            onClick={handleToggleSpeech}
            title={isRecording ? 'Stop voice dictation' : 'Start voice dictation'}
            className={`p-2.5 rounded-2xl transition-all ${
              isRecording
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        <input
          type="text"
          placeholder={`Message ${peer.name} on Nexconn Chat...`}
          value={inputMessage}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() && !selectedImage}
          className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-indigo-500/25 active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        requestId={activeRequest.id}
        volunteerName={activeRequest.volunteerName || 'Volunteer'}
      />
    </div>
  );
};
