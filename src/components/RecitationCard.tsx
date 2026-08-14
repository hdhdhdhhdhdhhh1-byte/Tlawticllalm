import React from 'react';
import { Recitation, PlayerState } from '../types';
import { Play, Pause, Heart, Headphones, Clock, Radio, User, Share2 } from 'lucide-react';

interface RecitationCardProps {
  recitation: Recitation;
  playerState: PlayerState;
  onPlay: (recitation: Recitation) => void;
  onLikeToggle: (recitationId: string) => void;
  onReciterClick?: (reciterId: string) => void;
}

export const RecitationCard: React.FC<RecitationCardProps> = ({
  recitation,
  playerState,
  onPlay,
  onLikeToggle,
  onReciterClick
}) => {
  const isCurrentPlaying =
    playerState.currentRecitation?.id === recitation.id && playerState.isPlaying;
  const isCurrentSelected = playerState.currentRecitation?.id === recitation.id;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: `${recitation.surahNameArabic} - تلاوتك للعالم`,
          text: `استمع لتلاوة خاشعة من ${recitation.surahNameArabic} للقارئ ${recitation.reciterName}`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `تلاوة ${recitation.surahNameArabic} بصوت القارئ ${recitation.reciterName} - منصة تلاوتك للعالم`
      );
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl p-4 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
        isCurrentSelected
          ? 'border-[#315F4A] bg-[#315F4A]/5 ring-1 ring-[#315F4A]'
          : 'border-[#E2E5DF] hover:border-[#315F4A]/60'
      }`}
    >
      <div>
        {/* Top Header: Surah, Riwayah, & Reciter */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button Circle */}
            <button
              onClick={() => onPlay(recitation)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-xs ${
                isCurrentPlaying
                  ? 'bg-[#315F4A] text-white ring-4 ring-[#315F4A]/20'
                  : 'bg-[#FAFBF9] border border-[#E2E5DF] text-[#315F4A] hover:bg-[#315F4A] hover:text-white'
              }`}
              title={isCurrentPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
            >
              {isCurrentPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current mr-0.5" />
              )}
            </button>

            <div>
              <h4 className="font-bold text-base text-[#102A20] font-amiri leading-tight">
                {recitation.surahNameArabic}
              </h4>
              <p className="text-xs text-[#7A847E] font-tajawal mt-0.5 flex items-center gap-1.5">
                <span>{recitation.ayahRange || 'كاملة'}</span>
                <span>•</span>
                <span className="text-[#315F4A] font-medium">{recitation.riwayah}</span>
              </p>
            </div>
          </div>

          {/* Duration Pill */}
          <div className="flex items-center gap-1 text-[11px] text-[#7A847E] bg-[#FAFBF9] px-2 py-0.5 rounded-full border border-[#E2E5DF]">
            <Clock className="w-3 h-3 text-[#7A847E]" />
            <span dir="ltr">{recitation.durationFormatted}</span>
          </div>
        </div>

        {/* Reciter Info */}
        <div
          onClick={() => onReciterClick?.(recitation.reciterId)}
          className="mt-3.5 flex items-center gap-2.5 p-2 rounded-xl bg-[#FAFBF9] border border-[#E2E5DF]/60 cursor-pointer hover:bg-[#E2E5DF]/30 transition-colors"
        >
          <img
            src={recitation.reciterAvatar}
            alt={recitation.reciterName}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover border border-[#E2E5DF]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#102A20] truncate">
              {recitation.reciterName}
            </p>
            <p className="text-[10px] text-[#7A847E] truncate">
              {recitation.reciterCountry}
            </p>
          </div>
          <span className="text-[10px] text-[#315F4A] font-medium px-2 py-0.5 rounded-md bg-white border border-[#E2E5DF]">
            الملف
          </span>
        </div>

        {recitation.description && (
          <p className="text-xs text-[#7A847E] mt-2.5 line-clamp-1 italic">
            "{recitation.description}"
          </p>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="mt-4 pt-3 border-t border-[#E2E5DF]/60 flex items-center justify-between">
        {/* Listen Count */}
        <div className="flex items-center gap-1.5 text-xs text-[#7A847E]">
          <Headphones className="w-3.5 h-3.5 text-[#C9A961]" />
          <span>🎧 {recitation.listenCount.toLocaleString('ar-EG')} استماع</span>
        </div>

        {/* Action buttons (Like & Share) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-1.5 text-[#7A847E] hover:text-[#102A20] rounded-lg hover:bg-[#FAFBF9] transition-colors"
            title="مشاركة التلاوة"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onLikeToggle(recitation.id);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              recitation.isLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-[#7A847E] hover:bg-[#FAFBF9] border border-transparent'
            }`}
            title="إعجاب بالتلاوة"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                recitation.isLiked ? 'fill-rose-500 text-rose-500' : 'text-[#7A847E]'
              }`}
            />
            <span>{recitation.likeCount.toLocaleString('ar-EG')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
