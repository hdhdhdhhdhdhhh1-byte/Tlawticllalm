import React from 'react';
import { PlayerState, Recitation } from '../types';
import { Play, Pause, SkipForward, SkipBack, Heart, Maximize2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { AudioService } from '../services/AudioService';

interface PlayerBarProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onLikeToggle: (recitationId: string) => void;
  onExpand: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  playerState,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onLikeToggle,
  onExpand
}) => {
  const current = playerState.currentRecitation;
  if (!current) return null;

  const progressPercent = playerState.duration > 0
    ? (playerState.currentTime / playerState.duration) * 100
    : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-6 sm:right-6 max-w-4xl mx-auto z-40">
      <div className="bg-[#102A20] text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-[#C9A961]/40 backdrop-blur-md">
        {/* Mini progress line on top */}
        <div className="relative w-full h-1 bg-white/10 rounded-full mb-2.5 overflow-hidden">
          <div
            className="absolute top-0 right-0 h-full bg-[#C9A961] transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Recitation Info & Cover */}
          <div
            onClick={onExpand}
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={current.reciterAvatar}
                alt={current.reciterName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {playerState.isPlaying && (
                <div className="absolute inset-0 bg-[#315F4A]/60 flex items-center justify-center gap-0.5">
                  <div className="w-0.5 bg-white wave-bar-1" />
                  <div className="w-0.5 bg-white wave-bar-3" />
                  <div className="w-0.5 bg-white wave-bar-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-[#FAFBF9] truncate font-amiri leading-tight">
                {current.surahNameArabic}
              </h4>
              <p className="text-xs text-[#C9A961] truncate font-tajawal">
                {current.reciterName} • {current.riwayah}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Time display */}
            <div className="hidden md:flex items-center gap-1 text-xs text-[#E2E5DF]/80" dir="ltr">
              <span>{AudioService.formatDuration(playerState.currentTime)}</span>
              <span>/</span>
              <span>{AudioService.formatDuration(playerState.duration || current.duration)}</span>
            </div>

            {/* Like */}
            <button
              onClick={() => onLikeToggle(current.id)}
              className={`p-2 rounded-full transition-colors ${
                current.isLiked ? 'text-rose-400' : 'text-white/60 hover:text-white'
              }`}
              title="إعجاب"
            >
              <Heart className={`w-4 h-4 ${current.isLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Previous */}
            <button
              onClick={onPrevious}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
              title="التلاوة السابقة"
            >
              <SkipForward className="w-4 h-4 rotate-180" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-[#C9A961] hover:bg-[#b8954d] text-[#102A20] flex items-center justify-center shadow-md active:scale-95 transition-all"
              title={playerState.isPlaying ? 'إيقاف' : 'تشغيل'}
            >
              {playerState.isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current mr-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
              title="التلاوة التالية"
            >
              <SkipBack className="w-4 h-4 rotate-180" />
            </button>

            {/* Expand Modal */}
            <button
              onClick={onExpand}
              className="p-2 text-white/70 hover:text-white transition-colors"
              title="تكبير المشغل"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
