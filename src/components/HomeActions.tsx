import React from 'react';
import { Headphones, Mic2, Trophy, ArrowLeft } from 'lucide-react';
import { NavigationTab } from '../types';

interface HomeActionsProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const HomeActions: React.FC<HomeActionsProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'listen-card',
      icon: Headphones,
      tab: 'listen' as NavigationTab,
      title: 'استمع إلى القراء',
      subtitle: 'اكتشف أصوات القرآن',
      description: 'استمع لتلاوات خاشعة بمختلف الروايات من قراء مجازين وموهوبين حول العالم.',
      badge: 'استماع مباشر',
      accentColor: '#315F4A',
      bgHover: 'hover:border-[#315F4A]'
    },
    {
      id: 'submit-card',
      icon: Mic2,
      tab: 'submit' as NavigationTab,
      title: 'انشر تلاوتك',
      subtitle: 'شارك صوتك مع العالم',
      description: 'أرسل تسجيل تلاوتك لمراجعتها واعتمادها من الإدارة لتصل للملايين.',
      badge: 'مراجعة واعتماد',
      accentColor: '#C9A961',
      bgHover: 'hover:border-[#C9A961]'
    },
    {
      id: 'featured-card',
      icon: Trophy,
      tab: 'featured' as NavigationTab,
      title: 'أبرز القراء',
      subtitle: 'الأكثر استماعًا وتأثيرًا',
      description: 'تعرف على التلاوات الأكثر إعجابًا واختيارات الإدارة والقراء الجدد.',
      badge: 'تصنيفات مميزة',
      accentColor: '#102A20',
      bgHover: 'hover:border-[#102A20]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            onClick={() => onNavigate(card.tab)}
            className={`cursor-pointer bg-white rounded-2xl p-5 border border-[#E2E5DF] ${card.bgHover} shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FAFBF9] border border-[#E2E5DF] flex items-center justify-center text-[#315F4A] group-hover:bg-[#315F4A] group-hover:text-white transition-colors shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FAFBF9] text-[#7A847E] border border-[#E2E5DF]">
                  {card.badge}
                </span>
              </div>

              <h3 className="font-bold text-lg text-[#102A20] group-hover:text-[#315F4A] transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-[#C9A961] font-semibold mt-0.5">
                {card.subtitle}
              </p>

              <p className="text-xs text-[#7A847E] leading-relaxed mt-2.5">
                {card.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2E5DF]/60 flex items-center justify-between text-xs font-semibold text-[#315F4A] group-hover:text-[#102A20]">
              <span>دخول القسم</span>
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
