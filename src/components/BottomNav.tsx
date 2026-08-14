import React from 'react';
import { Home, Headphones, Mic, Trophy, Info } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as NavigationTab, label: 'الرئيسية', icon: Home },
    { id: 'listen' as NavigationTab, label: 'استمع إلى القراء', icon: Headphones },
    { id: 'submit' as NavigationTab, label: 'انشر تلاوتك', icon: Mic, highlight: true },
    { id: 'featured' as NavigationTab, label: 'أبرز القراء', icon: Trophy },
    { id: 'about' as NavigationTab, label: 'عن التطبيق', icon: Info }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2E5DF] py-1.5 px-2 sm:px-4 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-4 group relative"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-[#102A20] text-[#C9A961] ring-4 ring-[#315F4A]/20'
                      : 'bg-[#315F4A] text-white hover:bg-[#102A20]'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                    isActive ? 'text-[#315F4A]' : 'text-[#7A847E]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[58px] ${
                isActive
                  ? 'text-[#315F4A]'
                  : 'text-[#7A847E] hover:text-[#102A20]'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-[#315F4A]/10' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-all font-tajawal ${
                  isActive ? 'font-bold text-[#315F4A]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
