import React, { useState, useEffect } from 'react';
import { Reciter, Recitation, DiscoveryFilter, PlayerState } from '../types';
import { Search, Filter, Headphones, Heart, Sparkles, Flame, Star, UserCheck, Globe, BookOpen } from 'lucide-react';
import { RecitationCard } from './RecitationCard';
import { ReciterCard } from './ReciterCard';
import { COUNTRIES_LIST, SURAH_LIST } from '../data/mockData';
import { statisticsRepository, reciterRepository } from '../services/Repositories';

interface ListenScreenProps {
  recitations: Recitation[];
  reciters: Reciter[];
  playerState: PlayerState;
  onPlay: (recitation: Recitation) => void;
  onLikeToggle: (recitationId: string) => void;
  onSelectReciter: (reciter: Reciter) => void;
}

export const ListenScreen: React.FC<ListenScreenProps> = ({
  recitations,
  reciters,
  playerState,
  onPlay,
  onLikeToggle,
  onSelectReciter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DiscoveryFilter>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedSurah, setSelectedSurah] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'recitations' | 'reciters'>('recitations');
  const [baseRecitations, setBaseRecitations] = useState<Recitation[]>(recitations);

  // Load ranked or filtered recitations from statistics repository
  useEffect(() => {
    let isMounted = true;
    async function loadFilteredRecitations() {
      let results: Recitation[] = [];
      if (activeFilter === 'popular') {
        results = await statisticsRepository.getMostListenedRecitations(50);
      } else if (activeFilter === 'most_liked') {
        results = await statisticsRepository.getMostLikedRecitations(50);
      } else if (activeFilter === 'latest') {
        results = await statisticsRepository.getNewestRecitations(50);
      } else {
        results = recitations;
      }
      if (isMounted) {
        setBaseRecitations(results);
      }
    }
    loadFilteredRecitations();
    return () => {
      isMounted = false;
    };
  }, [activeFilter, recitations]);

  // Secondary search & criteria filter logic
  const filteredRecitations = baseRecitations.filter((rec) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSurah =
        rec.surahNameArabic.toLowerCase().includes(q) ||
        rec.surahNameEnglish.toLowerCase().includes(q);
      const matchReciter = rec.reciterName.toLowerCase().includes(q);
      const matchRiwayah = rec.riwayah.toLowerCase().includes(q);
      if (!matchSurah && !matchReciter && !matchRiwayah) return false;
    }

    // Country match
    if (selectedCountry !== 'all' && !rec.reciterCountry.includes(selectedCountry)) {
      return false;
    }

    // Surah match
    if (selectedSurah !== 'all' && rec.surahNumber.toString() !== selectedSurah) {
      return false;
    }

    // Discovery filter for staff picks
    if (activeFilter === 'staff_picks' && !rec.isStaffPick) return false;

    return true;
  });

  const sortedRecitations = filteredRecitations;

  // Filter reciters
  const filteredReciters = reciters.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.displayName.toLowerCase().includes(q);
      const matchCountry = r.country.toLowerCase().includes(q);
      if (!matchName && !matchCountry) return false;
    }
    if (selectedCountry !== 'all' && !r.country.includes(selectedCountry)) {
      return false;
    }
    if (activeFilter === 'staff_picks' && !r.isStaffPick) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-amiri text-[#102A20]">
          استمع إلى القراء
        </h2>
        <p className="text-xs sm:text-sm text-[#7A847E] font-tajawal mt-1">
          اكتشف أصوات القرآن من حول العالم واستمع لتلاوات عذبة بمختلف الروايات
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن قارئ أو سورة (مثال: الفاتحة، مريم، الشهري)..."
          className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-white border border-[#E2E5DF] text-sm text-[#102A20] placeholder:text-[#7A847E] focus:outline-hidden focus:border-[#315F4A] focus:ring-2 focus:ring-[#315F4A]/10 shadow-xs"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A847E]" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#7A847E] hover:text-[#102A20] bg-[#FAFBF9] px-2 py-0.5 rounded-md border border-[#E2E5DF]"
          >
            مسح
          </button>
        )}
      </div>

      {/* Category Pills & Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Discovery Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#315F4A] text-white'
                  : 'bg-white text-[#7A847E] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
              }`}
            >
              الكل ({recitations.length})
            </button>

            <button
              onClick={() => setActiveFilter('popular')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'popular'
                  ? 'bg-[#315F4A] text-white'
                  : 'bg-white text-[#7A847E] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>🔥 الأكثر استماعًا</span>
            </button>

            <button
              onClick={() => setActiveFilter('most_liked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'most_liked'
                  ? 'bg-[#315F4A] text-white'
                  : 'bg-white text-[#7A847E] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>❤️ الأكثر إعجابًا</span>
            </button>

            <button
              onClick={() => setActiveFilter('staff_picks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'staff_picks'
                  ? 'bg-[#315F4A] text-white'
                  : 'bg-white text-[#7A847E] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-[#C9A961]" />
              <span>⭐ اختيار الإدارة</span>
            </button>

            <button
              onClick={() => setActiveFilter('latest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'latest'
                  ? 'bg-[#315F4A] text-white'
                  : 'bg-white text-[#7A847E] border border-[#E2E5DF] hover:bg-[#FAFBF9]'
              }`}
            >
              🆕 أحدث التلاوات
            </button>
          </div>

          {/* View Toggle: Recitations vs Reciters */}
          <div className="flex items-center gap-1 bg-[#FAFBF9] p-1 rounded-xl border border-[#E2E5DF]">
            <button
              onClick={() => setViewMode('recitations')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'recitations'
                  ? 'bg-white text-[#315F4A] shadow-xs'
                  : 'text-[#7A847E] hover:text-[#102A20]'
              }`}
            >
              التلاوات ({sortedRecitations.length})
            </button>
            <button
              onClick={() => setViewMode('reciters')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'reciters'
                  ? 'bg-white text-[#315F4A] shadow-xs'
                  : 'text-[#7A847E] hover:text-[#102A20]'
              }`}
            >
              القراء ({filteredReciters.length})
            </button>
          </div>
        </div>

        {/* Dropdown Filters (Country & Surah) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E5DF] text-xs text-[#102A20]"
            >
              <option value="all">🌍 جميع الدول ({COUNTRIES_LIST.length})</option>
              {COUNTRIES_LIST.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2E5DF] text-xs text-[#102A20]"
            >
              <option value="all">📖 جميع السور المتاحة</option>
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number.toString()}>
                  سورة {s.nameArabic} ({s.nameEnglish})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Content */}
      {viewMode === 'recitations' ? (
        <div className="space-y-3">
          {sortedRecitations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E2E5DF] p-6 space-y-2">
              <Headphones className="w-10 h-10 text-[#7A847E] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-[#102A20]">
                لم يتم العثور على تلاوات مطابقة
              </h3>
              <p className="text-xs text-[#7A847E]">
                جرب تغيير خيارات البحث أو الفلاتر لاستعراض التلاوات الأخرى.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedRecitations.map((recitation) => (
                <RecitationCard
                  key={recitation.id}
                  recitation={recitation}
                  playerState={playerState}
                  onPlay={onPlay}
                  onLikeToggle={onLikeToggle}
                  onReciterClick={(reciterId) => {
                    const found = reciters.find((r) => r.id === reciterId);
                    if (found) onSelectReciter(found);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Reciters List */
        <div className="space-y-3">
          {filteredReciters.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E2E5DF] p-6 space-y-2">
              <UserCheck className="w-10 h-10 text-[#7A847E] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-[#102A20]">
                لم يتم العثور على قراء مطابقين
              </h3>
              <p className="text-xs text-[#7A847E]">
                جرب البحث باسم آخر أو إزالة محدد الدولة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReciters.map((reciter) => (
                <ReciterCard
                  key={reciter.id}
                  reciter={reciter}
                  onClick={onSelectReciter}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
