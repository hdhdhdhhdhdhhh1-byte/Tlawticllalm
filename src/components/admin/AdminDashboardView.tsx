import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import { AdminDashboardStats, AdminTab } from '../../types';
import {
  Users,
  UserCheck,
  Music,
  Radio,
  FileCheck,
  Headphones,
  Heart,
  Trophy,
  Sparkles,
  PlusCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Megaphone,
  Award,
  Bell
} from 'lucide-react';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminDashboardView({ onNavigateTab }: AdminDashboardViewProps) {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalReciters: 0,
    publishedReciters: 0,
    totalRecitations: 0,
    publishedRecitations: 0,
    pendingSubmissions: 0,
    totalListens: 0,
    totalLikes: 0,
    activeCompetitions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Error loading stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8 select-none font-tajawal">
      {/* Title & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#234235]">
        <div>
          <h1 className="text-2xl font-bold font-amiri text-[#F0F5F2] flex items-center gap-2.5">
            <span>لوحة تحكم تلاوتك للعالم</span>
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </h1>
          <p className="text-xs text-[#8BA496] mt-1">
            مركز المراقبة والتحكم في القراء والتلاوات والمراجعة التحريرية الشاملة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="px-3 py-2 bg-[#162720] hover:bg-[#1E372C] text-[#A8C2B3] hover:text-white rounded-xl border border-[#2B493B] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث المؤشرات</span>
          </button>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: إجمالي القراء */}
        <div
          onClick={() => onNavigateTab('reciters')}
          className="p-4 bg-[#14241D] hover:bg-[#192E25] border border-[#234235] rounded-2xl cursor-pointer transition space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BA496]">إجمالي القراء</span>
            <div className="w-8 h-8 rounded-lg bg-[#1D3B2E] border border-[#2B5742] flex items-center justify-center text-[#4B8569] group-hover:text-[#D4AF37] transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#F0F5F2]">
            {stats.totalReciters.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-[#6E8E7E] flex items-center gap-1">
            <span>عرض وإدارة القراء</span>
            <ArrowLeft className="w-3 h-3 text-[#4B8569]" />
          </div>
        </div>

        {/* Card 2: القراء المنشورون */}
        <div
          onClick={() => onNavigateTab('reciters')}
          className="p-4 bg-[#14241D] hover:bg-[#192E25] border border-[#234235] rounded-2xl cursor-pointer transition space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BA496]">القراء المنشورون</span>
            <div className="w-8 h-8 rounded-lg bg-[#1D3B2E] border border-[#2B5742] flex items-center justify-center text-[#34D399]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#34D399]">
            {stats.publishedReciters.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-[#6E8E7E]">
            {stats.totalReciters > 0
              ? `${Math.round((stats.publishedReciters / stats.totalReciters) * 100)}% من إجمالي القراء`
              : 'جاهز للإضافة والتسجيل'}
          </div>
        </div>

        {/* Card 3: إجمالي التلاوات */}
        <div
          onClick={() => onNavigateTab('recitations')}
          className="p-4 bg-[#14241D] hover:bg-[#192E25] border border-[#234235] rounded-2xl cursor-pointer transition space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BA496]">إجمالي التلاوات</span>
            <div className="w-8 h-8 rounded-lg bg-[#1D3B2E] border border-[#2B5742] flex items-center justify-center text-[#60A5FA]">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#F0F5F2]">
            {stats.totalRecitations.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-[#6E8E7E] flex items-center gap-1">
            <span>عرض مكتبة التلاوات</span>
            <ArrowLeft className="w-3 h-3 text-[#4B8569]" />
          </div>
        </div>

        {/* Card 4: التلاوات المنشورة */}
        <div
          onClick={() => onNavigateTab('recitations')}
          className="p-4 bg-[#14241D] hover:bg-[#192E25] border border-[#234235] rounded-2xl cursor-pointer transition space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BA496]">التلاوات المنشورة</span>
            <div className="w-8 h-8 rounded-lg bg-[#1D3B2E] border border-[#2B5742] flex items-center justify-center text-[#D4AF37]">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#D4AF37]">
            {stats.publishedRecitations.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-[#6E8E7E]">
            تظهر حالياً في تطبيق الهاتف
          </div>
        </div>

        {/* Card 5: طلبات التلاوة الجديدة */}
        <div
          onClick={() => onNavigateTab('submissions')}
          className="p-4 bg-[#1E2E24] hover:bg-[#25392D] border-2 border-[#D4AF37]/50 rounded-2xl cursor-pointer transition space-y-2 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5E6B8]">طلبات التلاوة الجديدة</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#F0F5F2] flex items-center gap-2">
            <span>{stats.pendingSubmissions.toLocaleString('ar-EG')}</span>
            {stats.pendingSubmissions > 0 && (
              <span className="px-2 py-0.5 bg-[#D4AF37] text-[#0F1C16] text-[10px] font-bold rounded-full">
                بانتظار المراجعة
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1">
            <span>فحص وتدقيق الطلبات</span>
            <ArrowLeft className="w-3 h-3" />
          </div>
        </div>

        {/* Card 6: إجمالي الاستماعات */}
        <div
          onClick={() => onNavigateTab('statistics')}
          className="p-4 bg-[#14241D] hover:bg-[#192E25] border border-[#234235] rounded-2xl cursor-pointer transition space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BA496]">إجمالي الاستماعات</span>
            <div className="w-8 h-8 rounded-lg bg-[#1D3B2E] border border-[#2B5742] flex items-center justify-center text-[#A78BFA]">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#F0F5F2]">
            {stats.totalListens.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-[#6E8E7E]">
            مسجلة عبر الخادم السحابي
          </div>
        </div>

        {/* Card 7: إجمالي الإعجابات */}
        <div
          onClick={() => onNavigateTab('statistics')}
          className="p-4 bg-[#14241D] hover:bg-[#192E25] border border-[#234235] rounded-2xl cursor-pointer transition space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BA496]">إجمالي الإعجابات</span>
            <div className="w-8 h-8 rounded-lg bg-[#1D3B2E] border border-[#2B5742] flex items-center justify-center text-[#F43F5E]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#F0F5F2]">
            {stats.totalLikes.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-[#6E8E7E]">
            تفاعلات المستمعين
          </div>
        </div>

        {/* Card 8: المسابقات النشطة */}
        <div
          onClick={() => onNavigateTab('competitions')}
          className="p-4 bg-[#14241D] hover:bg-[#192E25] border border-[#234235] rounded-2xl cursor-pointer transition space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8BA496]">المسابقات النشطة</span>
            <div className="w-8 h-8 rounded-lg bg-[#1D3B2E] border border-[#2B5742] flex items-center justify-center text-[#FBBF24]">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-amiri text-[#F0F5F2]">
            {stats.activeCompetitions.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-[#6E8E7E]">
            تحديات قرآنية تحفيزية
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-[#14241D] border border-[#234235] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold font-amiri text-[#F0F5F2] flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>الإجراءات السريعة</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateTab('submissions')}
            className="p-3 bg-[#1A3328] hover:bg-[#224435] text-white rounded-xl border border-[#2B5742] flex flex-col items-center justify-center gap-2 text-xs font-semibold transition group"
          >
            <FileCheck className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition" />
            <span>مراجعة الطلبات</span>
          </button>

          <button
            onClick={() => onNavigateTab('reciters')}
            className="p-3 bg-[#1A3328] hover:bg-[#224435] text-white rounded-xl border border-[#2B5742] flex flex-col items-center justify-center gap-2 text-xs font-semibold transition group"
          >
            <Users className="w-5 h-5 text-[#34D399] group-hover:scale-110 transition" />
            <span>إضافة قارئ جديد</span>
          </button>

          <button
            onClick={() => onNavigateTab('recitations')}
            className="p-3 bg-[#1A3328] hover:bg-[#224435] text-white rounded-xl border border-[#2B5742] flex flex-col items-center justify-center gap-2 text-xs font-semibold transition group"
          >
            <Music className="w-5 h-5 text-[#60A5FA] group-hover:scale-110 transition" />
            <span>إضافة تلاوة جديدة</span>
          </button>

          <button
            onClick={() => onNavigateTab('announcements')}
            className="p-3 bg-[#1A3328] hover:bg-[#224435] text-white rounded-xl border border-[#2B5742] flex flex-col items-center justify-center gap-2 text-xs font-semibold transition group"
          >
            <Megaphone className="w-5 h-5 text-[#F59E0B] group-hover:scale-110 transition" />
            <span>نشر إعلان</span>
          </button>

          <button
            onClick={() => onNavigateTab('competitions')}
            className="p-3 bg-[#1A3328] hover:bg-[#224435] text-white rounded-xl border border-[#2B5742] flex flex-col items-center justify-center gap-2 text-xs font-semibold transition group"
          >
            <Trophy className="w-5 h-5 text-[#FBBF24] group-hover:scale-110 transition" />
            <span>مسابقة جديدة</span>
          </button>

          <button
            onClick={() => onNavigateTab('rewards')}
            className="p-3 bg-[#1A3328] hover:bg-[#224435] text-white rounded-xl border border-[#2B5742] flex flex-col items-center justify-center gap-2 text-xs font-semibold transition group"
          >
            <Award className="w-5 h-5 text-[#A78BFA] group-hover:scale-110 transition" />
            <span>منح أوسمة</span>
          </button>
        </div>
      </div>

      {/* Production Readiness Status Box */}
      <div className="p-5 bg-gradient-to-br from-[#162B21] to-[#11211A] border border-[#234235] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h3 className="text-sm font-bold text-[#F0F5F2]">حالة اتصال بيئة الإنتاج السحابية (Supabase Live)</h3>
          </div>
          <p className="text-xs text-[#8BA496] leading-relaxed">
            قاعدة البيانات نشطة ومتصلة عبر مفتاح الوصول العام. السياسات الأمنية (RLS) مفعلة وتضمن عزل بيانات المراجعة الخاصة.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('submissions')}
          className="px-4 py-2.5 bg-[#2B5742] hover:bg-[#346950] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition"
        >
          <span>عرض طلبات التلاوة ({stats.pendingSubmissions})</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
