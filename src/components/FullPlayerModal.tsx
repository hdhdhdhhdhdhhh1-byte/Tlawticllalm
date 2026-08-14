import React, { useState } from 'react';
import { PlayerState, Recitation } from '../types';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  RotateCcw,
  Gauge,
  BookOpen,
  Info,
  Radio,
  Sparkles,
  Layers
} from 'lucide-react';
import { AudioService, audioService } from '../services/AudioService';

interface FullPlayerModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onLikeToggle: (recitationId: string) => void;
  onReciterClick?: (reciterId: string) => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  playerState,
  onClose,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onLikeToggle,
  onReciterClick
}) => {
  const current = playerState.currentRecitation;
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<'player' | 'details'>('player');

  if (!current) return null;

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const maxDuration = playerState.duration || current.duration || 100;
  const progressPercent = (playerState.currentTime / maxDuration) * 100;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${current.surahNameArabic} - القارئ ${current.reciterName}`,
        text: `استمع لتلاوة خاشعة من ${current.surahNameArabic} للقارئ ${current.reciterName} عبر منصة تلاوتك للعالم`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `استمع لتلاوة ${current.surahNameArabic} بصوت ${current.reciterName} على تلاوتك للعالم`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#102A20]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#102A20] text-white rounded-3xl w-full max-w-lg border border-[#C9A961]/30 shadow-2xl p-6 relative flex flex-col justify-between my-auto max-h-[92vh]">
        {/* Top Header Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="تصغير"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-xs text-[#C9A961] font-semibold tracking-wide">
              مشغل القرآن الكريم
            </span>
            <h3 className="text-sm font-bold text-white font-amiri">
              تلاوتك للعالم • Tilawatak Player
            </h3>
          </div>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="مشاركة التلاوة"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector: Player vs Recitation Details */}
        <div className="flex items-center justify-center gap-2 mb-4 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setInfoTab('player')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              infoTab === 'player'
                ? 'bg-[#315F4A] text-white shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            المشغل الصوتي
          </button>
          <button
            onClick={() => setInfoTab('details')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              infoTab === 'details'
                ? 'bg-[#315F4A] text-white shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            بيانات التلاوة والقارئ
          </button>
        </div>

        {infoTab === 'player' ? (
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {/* Album Cover & Artwork Visualizer */}
            <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C9A961]/40 group">
              <img
                src={current.coverUrl || current.reciterAvatar}
                alt={current.surahNameArabic}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102A20]/90 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-[11px] text-[#C9A961] font-semibold">
                  {current.riwayah}
                </span>
                <span className="text-lg font-bold text-white font-amiri">
                  {current.surahNameArabic}
                </span>
              </div>
            </div>

            {/* Title & Reciter Meta */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold font-amiri text-white">
                {current.surahNameArabic}
              </h2>
              <div
                onClick={() => {
                  onClose();
                  onReciterClick?.(current.reciterId);
                }}
                className="inline-flex items-center gap-1.5 cursor-pointer text-sm text-[#C9A961] hover:underline font-semibold"
              >
                <span>القارئ: {current.reciterName}</span>
                <span className="text-xs text-white/60">({current.reciterCountry})</span>
              </div>
              <p className="text-xs text-white/70">
                الآيات: {current.ayahRange || 'كاملة'}
              </p>
            </div>

            {/* Seek Bar & Timers */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={maxDuration}
                  step={1}
                  value={playerState.currentTime}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C9A961]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/70 font-mono" dir="ltr">
                <span>{AudioService.formatDuration(playerState.currentTime)}</span>
                <span>{AudioService.formatDuration(maxDuration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-6 sm:gap-8">
              {/* Like Button */}
              <button
                onClick={() => onLikeToggle(current.id)}
                className={`p-3 rounded-full transition-all active:scale-95 ${
                  current.isLiked
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-white/10 text-white/80 hover:text-white'
                }`}
                title="إعجاب بالتلاوة"
              >
                <Heart className={`w-5 h-5 ${current.isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Previous */}
              <button
                onClick={onPrevious}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                title="التلاوة السابقة"
              >
                <SkipForward className="w-5 h-5 rotate-180" />
              </button>

              {/* Big Play/Pause Button */}
              <button
                onClick={onTogglePlay}
                className="w-16 h-16 rounded-full bg-[#C9A961] hover:bg-[#b8954d] text-[#102A20] flex items-center justify-center shadow-lg active:scale-95 transition-all ring-4 ring-[#C9A961]/20"
                title={playerState.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {playerState.isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current mr-1" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={onNext}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                title="التلاوة التالية"
              >
                <SkipBack className="w-5 h-5 rotate-180" />
              </button>

              {/* Playback Speed selector */}
              <div className="relative">
                <button
                  onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  title="سرعة التلاوة"
                >
                  <Gauge className="w-3.5 h-3.5 text-[#C9A961]" />
                  <span>{playerState.playbackSpeed}x</span>
                </button>

                {speedMenuOpen && (
                  <div className="absolute bottom-12 left-0 bg-[#1A3F31] border border-[#C9A961]/40 rounded-xl p-1 shadow-xl z-50 flex flex-col gap-1 min-w-[70px]">
                    {speeds.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          audioService.setSpeed(s);
                          setSpeedMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors ${
                          playerState.playbackSpeed === s
                            ? 'bg-[#C9A961] text-[#102A20]'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Recitation Details Tab */
          <div className="p-4 space-y-4 bg-white/5 rounded-2xl border border-white/10 overflow-y-auto flex-1">
            <h4 className="font-bold text-base text-[#C9A961] font-amiri flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>بطاقة التلاوة والاعتماد</span>
            </h4>

            <div className="space-y-2.5 text-xs text-white/90">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/60">السورة:</span>
                <span className="font-bold font-amiri text-sm">{current.surahNameArabic} ({current.surahNameEnglish})</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/60">القارئ:</span>
                <span className="font-semibold">{current.reciterName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/60">الرواية وطريقها:</span>
                <span className="text-[#C9A961] font-semibold">{current.riwayah}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/60">الآيات المسجلة:</span>
                <span>{current.ayahRange || 'كاملة'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/60">مرات الاستماع:</span>
                <span>🎧 {current.listenCount.toLocaleString('ar-EG')}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-white/60">الإعجابات:</span>
                <span>❤️ {current.likeCount.toLocaleString('ar-EG')}</span>
              </div>

              {current.description && (
                <div className="pt-2">
                  <span className="text-white/60 block mb-1">وصف التسجيل:</span>
                  <p className="text-white/80 bg-white/5 p-2.5 rounded-lg leading-relaxed text-xs">
                    {current.description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#315F4A]/30 border border-[#315F4A] text-[11px] text-[#F4E8CE] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#C9A961]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حالة الجودة والاعتماد</span>
              </div>
              <p>
                تلاوة معتمدة ومطابقة لأحكام التجويد والترتيل الصحيح من قبل اللجنة المختصة بمنصة تلاوتك للعالم.
              </p>
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center text-[10px] text-white/50">
          مشغل تلاوتك للعالم • بنية جاهزة للتشغيل في الخلفية وإشعارات أندرويد الإعلامية
        </div>
      </div>
    </div>
  );
};
