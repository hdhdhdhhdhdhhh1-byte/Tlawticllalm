import React from 'react';
import { BookOpen, Radio, Globe, Shield, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onSubmitClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onSubmitClick
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#102A20] via-[#1A3F31] to-[#315F4A] text-white p-6 sm:p-8 md:p-10 shadow-lg border border-[#C9A961]/30">
      {/* Background Decorative Quranic Geometry & Soundwave Aura */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-8 border-[#C9A961] blur-2xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full border-8 border-white blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Text & Slogan */}
        <div className="flex-1 text-center md:text-right space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A961]/20 border border-[#C9A961]/40 text-[#F4E8CE] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>منصة عالمية معتمدة لتلاوات كتاب الله الكريم</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-amiri text-[#FAFBF9] leading-tight">
            تلاوتك للعالم
          </h2>

          <p className="text-[#C9A961] font-semibold text-lg sm:text-xl font-tajawal">
            "انشر تلاوتك... واكتشف أصوات القرآن من حول العالم"
          </p>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <h3 className="text-sm font-semibold text-white/90">
              مرحبًا بك في تلاوتك للعالم
            </h3>
            <p className="text-xs sm:text-sm text-[#E2E5DF]/80 leading-relaxed max-w-xl">
              منصة تجمع أصوات القراء وتتيح لك الاستماع إلى تلاواتهم واكتشاف أصوات جديدة من مختلف أنحاء العالم، مع إمكانية إرسال تلاوتك للمراجعة والاعتماد.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 rounded-xl bg-[#C9A961] hover:bg-[#b8954d] text-[#102A20] font-bold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-[#102A20]" />
              <span>استمع إلى القراء الآن</span>
            </button>
            <button
              onClick={onSubmitClick}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2 backdrop-blur-xs"
            >
              <BookOpen className="w-4 h-4 text-[#C9A961]" />
              <span>انشر تلاوتك للمراجعة</span>
            </button>
          </div>
        </div>

        {/* Conceptual Replaceable Artwork Placeholder: home_hero */}
        <div 
          id="home_hero"
          className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl bg-gradient-to-tr from-[#102A20]/80 to-[#315F4A]/60 border border-[#C9A961]/40 p-4 flex flex-col items-center justify-center text-center relative shadow-2xl backdrop-blur-sm group"
        >
          {/* Subtle audio wave animation bars */}
          <div className="flex items-center gap-1 mb-3">
            <div className="w-1 bg-[#C9A961] rounded-full wave-bar-1" />
            <div className="w-1 bg-[#C9A961] rounded-full wave-bar-2" />
            <div className="w-1 bg-[#C9A961] rounded-full wave-bar-3" />
            <div className="w-1 bg-[#C9A961] rounded-full wave-bar-4" />
            <div className="w-1 bg-[#C9A961] rounded-full wave-bar-5" />
          </div>

          {/* Open Quran Visual Emblem */}
          <div className="w-20 h-20 rounded-full bg-[#FAFBF9]/10 border border-[#C9A961]/60 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <BookOpen className="w-10 h-10 text-[#C9A961]" />
          </div>

          <span className="font-amiri font-bold text-base text-[#F4E8CE]">
            القرآن الكريم
          </span>
          <span className="text-[10px] text-[#E2E5DF]/70 mt-1">
            صوت نقي • وصول عالمي
          </span>

          {/* Tag for artwork placeholder requirement */}
          <span className="absolute bottom-2 text-[9px] text-[#C9A961]/60 tracking-wider font-mono">
            [RESOURCE: home_hero]
          </span>
        </div>
      </div>
    </section>
  );
};
