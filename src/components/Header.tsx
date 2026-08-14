import React from 'react';
import { Sparkles, Code2, Clock, Globe, ShieldCheck } from 'lucide-react';
import { RecitationSubmission } from '../types';

interface HeaderProps {
  onOpenSubmissions: () => void;
  submissions: RecitationSubmission[];
  onOpenArchitecture: () => void;
  isTabletView: boolean;
  onToggleTabletView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmissions,
  submissions,
  onOpenArchitecture,
  isTabletView,
  onToggleTabletView
}) => {
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 bg-[#FAFBF9]/90 backdrop-blur-md border-b border-[#E2E5DF]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#315F4A] flex items-center justify-center text-white shadow-sm border border-[#C9A961]/30">
            <span className="font-amiri font-bold text-xl text-[#C9A961]">ت</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg text-[#102A20] leading-tight">
                تلاوتك للعالم
              </h1>
              <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-[#C9A961]/20 text-[#8c6f2a] font-medium">
                منصة عالمية
              </span>
            </div>
            <p className="text-[11px] text-[#7A847E] font-tajawal tracking-tight">
              TilawatakLilAlam • منصة التلاوات القرآنية
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Submissions Status Badge */}
          <button
            onClick={onOpenSubmissions}
            className="relative px-3 py-1.5 rounded-lg bg-white border border-[#E2E5DF] text-[#315F4A] hover:bg-[#315F4A]/5 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="متابعة حالة تلاواتي المرسلة"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">طلباتي</span>
            {submissions.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#315F4A] text-white text-[10px] flex items-center justify-center font-bold">
                {submissions.length}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C9A961] animate-ping" />
            )}
          </button>

          {/* Android Kotlin / Jetpack Compose Architecture Viewer */}
          <button
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 rounded-lg bg-[#102A20] text-[#C9A961] hover:bg-[#102A20]/90 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs"
            title="استعراض هيكل بنية أندرويد النظيفة Clean Architecture"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">بنية Kotlin / Compose</span>
            <span className="sm:hidden text-[10px]">Android</span>
          </button>
        </div>
      </div>
    </header>
  );
};
