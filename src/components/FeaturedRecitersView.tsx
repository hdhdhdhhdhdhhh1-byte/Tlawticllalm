import React, { useState, useEffect } from 'react';
import { Reciter, Recitation, PlayerState } from '../types';
import { Trophy, Flame, Heart, Sparkles, Star, UserPlus, Globe, Headphones, BookOpen, ArrowLeft } from 'lucide-react';
import { ReciterCard } from './ReciterCard';
import { RecitationCard } from './RecitationCard';
import { statisticsRepository, reciterRepository } from '../services/Repositories';

interface FeaturedRecitersViewProps {
  reciters: Reciter[];
  recitations: Recitation[];
  playerState: PlayerState;
  onSelectReciter: (reciter: Reciter) => void;
  onPlay: (recitation: Recitation) => void;
  onLikeToggle: (recitationId: string) => void;
}

export const FeaturedRecitersView: React.FC<FeaturedRecitersViewProps> = ({
  reciters,
  recitations,
  playerState,
  onSelectReciter,
  onPlay,
  onLikeToggle
}) => {
  const [activeCategory, setActiveCategory] = useState<'listens' | 'likes' | 'staff' | 'new'>('listens');
  const [currentReciters, setCurrentReciters] = useState<Reciter[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryReciters() {
      let results: Reciter[] = [];
      switch (activeCategory) {
        case 'listens':
          results = await statisticsRepository.getMostListenedReciters(20);
          break;
        case 'likes':
          results = await statisticsRepository.getMostLikedReciters(20);
          break;
        case 'staff':
          results = await reciterRepository.getFeaturedReciters();
          break;
        case 'new':
          results = await reciterRepository.getNewestReciters(20);
          break;
      }
      if (isMounted) {
        setCurrentReciters(results);
      }
    }
    loadCategoryReciters();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, reciters]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#102A20] via-[#1A3F31] to-[#315F4A] text-white p-6 sm:p-8 rounded-3xl border border-[#C9A961]/30 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A961]/20 text-[#F4E8CE] text-xs">
            <Trophy className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>لوحة الشرف وقوائم التميز</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-amiri text-[#FAFBF9]">
            أبرز القراء والتلاوات
          </h2>
          <p className="text-xs sm:text-sm text-[#E2E5DF]/80 leading-relaxed">
            استكشف القراء الأعلى استماعًا، والأكثر إعجابًا، مع اختيارات الإدارة والتلاوات الجديدة المعتمدة.
          </p>
        </div>
      </div>

      {/* Category Pills Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('listens')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeCategory === 'listens'
              ? 'bg-[#315F4A] text-white shadow-sm'
              : 'bg-white text-[#102A20] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
          }`}
        >
          <Flame className={`w-4 h-4 ${activeCategory === 'listens' ? 'text-[#C9A961]' : 'text-amber-500'}`} />
          <span>🔥 الأكثر استماعًا</span>
        </button>

        <button
          onClick={() => setActiveCategory('likes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeCategory === 'likes'
              ? 'bg-[#315F4A] text-white shadow-sm'
              : 'bg-white text-[#102A20] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeCategory === 'likes' ? 'text-rose-300' : 'text-rose-500'}`} />
          <span>❤️ الأكثر إعجابًا</span>
        </button>

        <button
          onClick={() => setActiveCategory('staff')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeCategory === 'staff'
              ? 'bg-[#315F4A] text-white shadow-sm'
              : 'bg-white text-[#102A20] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
          }`}
        >
          <Star className={`w-4 h-4 ${activeCategory === 'staff' ? 'text-[#C9A961]' : 'text-amber-400'}`} />
          <span>⭐ اختيار الإدارة</span>
        </button>

        <button
          onClick={() => setActiveCategory('new')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeCategory === 'new'
              ? 'bg-[#315F4A] text-white shadow-sm'
              : 'bg-white text-[#102A20] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
          }`}
        >
          <UserPlus className={`w-4 h-4 ${activeCategory === 'new' ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <span>🆕 القراء الجدد</span>
        </button>
      </div>

      {/* Top 3 Podium Highlights for Listens/Likes */}
      {(activeCategory === 'listens' || activeCategory === 'likes') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentReciters.slice(0, 3).map((reciter, index) => {
            const rankBadges = [
              { label: 'المركز الأول', bg: 'bg-[#C9A961]', text: 'text-[#102A20]', icon: '🥇' },
              { label: 'المركز الثاني', bg: 'bg-slate-300', text: 'text-[#102A20]', icon: '🥈' },
              { label: 'المركز الثالث', bg: 'bg-amber-700', text: 'text-white', icon: '🥉' }
            ];
            const badge = rankBadges[index];

            return (
              <div
                key={reciter.id}
                onClick={() => onSelectReciter(reciter)}
                className="cursor-pointer bg-white rounded-3xl p-5 border border-[#E2E5DF] hover:border-[#315F4A] shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} flex items-center gap-1`}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-xs text-[#7A847E] font-medium">
                    {reciter.country}
                  </span>
                </div>

                <div className="flex items-center gap-3 my-2">
                  <img
                    src={reciter.avatarUrl}
                    alt={reciter.displayName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#C9A961]"
                  />
                  <div>
                    <h4 className="font-bold text-base text-[#102A20]">
                      {reciter.displayName}
                    </h4>
                    <p className="text-xs text-[#7A847E] mt-0.5 line-clamp-1">
                      {reciter.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E5DF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#315F4A] font-bold">
                    <Headphones className="w-3.5 h-3.5 text-[#C9A961]" />
                    <span>{reciter.stats.totalListens.toLocaleString('ar-EG')} استماع</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-500 font-bold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{reciter.stats.totalLikes.toLocaleString('ar-EG')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reciters Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-[#102A20] font-amiri">
          قائمة القراء ({currentReciters.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentReciters.map((reciter) => (
            <ReciterCard
              key={reciter.id}
              reciter={reciter}
              onClick={onSelectReciter}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
