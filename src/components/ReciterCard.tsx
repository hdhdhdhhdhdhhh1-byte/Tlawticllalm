import React from 'react';
import { Reciter } from '../types';
import { CheckCircle2, Globe, Headphones, Heart, BookOpen, Shield } from 'lucide-react';

interface ReciterCardProps {
  reciter: Reciter;
  onClick: (reciter: Reciter) => void;
}

export const ReciterCard: React.FC<ReciterCardProps> = ({ reciter, onClick }) => {
  return (
    <div
      onClick={() => onClick(reciter)}
      className="cursor-pointer bg-white rounded-2xl p-4 border border-[#E2E5DF] hover:border-[#315F4A] shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
    >
      <div>
        {/* Reciter Avatar & Verification */}
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={reciter.avatarUrl}
              alt={reciter.displayName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#E2E5DF] group-hover:border-[#315F4A] transition-colors"
            />
            {reciter.verified && (
              <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs" title="قارئ موثق ومعتمد">
                <CheckCircle2 className="w-4 h-4 text-[#315F4A] fill-[#FAFBF9]" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm text-[#102A20] group-hover:text-[#315F4A] transition-colors truncate">
                {reciter.displayName}
              </h4>
              {reciter.isAnonymous && (
                <span className="text-[10px] bg-[#FAFBF9] border border-[#E2E5DF] text-[#7A847E] px-1.5 py-0.2 rounded font-medium">
                  مستعار
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-[#7A847E] mt-0.5">
              <Globe className="w-3 h-3 text-[#C9A961]" />
              <span>{reciter.country}</span>
            </div>

            {reciter.isStaffPick && (
              <span className="inline-block text-[10px] font-semibold text-[#8c6f2a] bg-[#C9A961]/15 px-2 py-0.5 rounded-full mt-1.5">
                ⭐ اختيار الإدارة
              </span>
            )}
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-[#7A847E] line-clamp-2 mt-3 leading-relaxed">
          {reciter.bio}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="mt-4 pt-3 border-t border-[#E2E5DF]/70 flex items-center justify-between text-[11px] text-[#7A847E]">
        <div className="flex items-center gap-1" title="عدد التلاوات المعتمدة">
          <BookOpen className="w-3.5 h-3.5 text-[#315F4A]" />
          <span>{reciter.stats.totalRecitations} تلاوات</span>
        </div>

        <div className="flex items-center gap-1" title="إجمالي مرات الاستماع">
          <Headphones className="w-3.5 h-3.5 text-[#C9A961]" />
          <span>{reciter.stats.totalListens.toLocaleString('ar-EG')}</span>
        </div>

        <div className="flex items-center gap-1" title="إجمالي الإعجابات">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
          <span>{reciter.stats.totalLikes.toLocaleString('ar-EG')}</span>
        </div>
      </div>
    </div>
  );
};
