import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import { AdminAuthState } from '../../types';
import { AdminLoginScreen } from './AdminLoginScreen';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminSubmissionsView } from './AdminSubmissionsView';
import { AdminRecitersView } from './AdminRecitersView';
import { AdminRecitationsView } from './AdminRecitationsView';
import { AdminAnnouncementsView } from './AdminAnnouncementsView';
import { AdminCompetitionsView } from './AdminCompetitionsView';
import { AdminRewardsView } from './AdminRewardsView';
import { AdminStatisticsView } from './AdminStatisticsView';
import { AdminNotificationsView } from './AdminNotificationsView';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  BookOpen,
  Megaphone,
  Trophy,
  Award,
  BarChart3,
  Bell,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'submissions'
  | 'reciters'
  | 'recitations'
  | 'announcements'
  | 'competitions'
  | 'rewards'
  | 'statistics'
  | 'notifications';

interface AdminControlPanelProps {
  onBackToApp: () => void;
}

export function AdminControlPanel({ onBackToApp }: AdminControlPanelProps) {
  const [authState, setAuthState] = useState<AdminAuthState>(adminService.getAuthState());
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  useEffect(() => {
    const unsub = adminService.subscribe((state) => {
      setAuthState(state);
    });
    return () => unsub();
  }, []);

  // Fetch pending items and notifications count
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const fetchBadges = async () => {
      try {
        const stats = await adminService.getDashboardStats();
        setPendingCount(stats.pendingSubmissions || 0);

        const notifs = await adminService.getAdminNotifications();
        setUnreadNotificationsCount(notifs.filter((n) => !n.isRead).length);
      } catch (e) {
        // Silently handle
      }
    };

    fetchBadges();
  }, [authState.isAuthenticated, activeTab]);

  if (!authState.isAuthenticated) {
    return (
      <AdminLoginScreen
        onSuccess={() => setActiveTab('dashboard')}
        onBackToApp={onBackToApp}
      />
    );
  }

  const handleLogout = async () => {
    await adminService.logout();
  };

  const navItems: { id: AdminTab; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'لوحة القيادة والمؤشرات', icon: LayoutDashboard },
    {
      id: 'submissions',
      label: 'مراجعة طلبات التلاوات',
      icon: FileCheck,
      badge: pendingCount,
      badgeColor: 'bg-[#D4AF37] text-[#0F1C16]'
    },
    { id: 'reciters', label: 'إدارة ملفات القراء', icon: Users },
    { id: 'recitations', label: 'إدارة التلاوات والتسجيلات', icon: BookOpen },
    { id: 'announcements', label: 'الإعلانات والتعاميم', icon: Megaphone },
    { id: 'competitions', label: 'المسابقات والفعاليات', icon: Trophy },
    { id: 'rewards', label: 'الأوسمة والجوائز التقديرية', icon: Award },
    { id: 'statistics', label: 'التقارير والإحصائيات', icon: BarChart3 },
    {
      id: 'notifications',
      label: 'التنبيهات الإدارية',
      icon: Bell,
      badge: unreadNotificationsCount,
      badgeColor: 'bg-emerald-500 text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A1410] text-[#E8EFEA] flex flex-col font-tajawal select-none" dir="rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#102019]/95 backdrop-blur-md border-b border-[#234235] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 text-[#A8C2B3] hover:text-white rounded-xl bg-[#162B22] border border-[#2B493B]"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Admin Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2B5742] to-[#173327] border border-[#3E745A] flex items-center justify-center text-[#D4AF37] shadow-inner font-amiri font-bold text-lg">
              ت
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-[#F0F5F2] font-amiri">
                  لوحة تحكم إدارة منصة تلاوتك للعالم
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  {authState.admin?.role === 'SUPER_ADMIN' ? 'المدير العام' : 'مشرف ومراجع'}
                </span>
              </div>
              <p className="text-[11px] text-[#8BA496]">
                الإشراف العام • مراجعة القراءات • اعتماد التلاوات
              </p>
            </div>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToApp}
            className="px-3 py-1.5 rounded-xl bg-[#162B22] hover:bg-[#1E3B2E] border border-[#2B493B] text-xs font-semibold text-[#A8C2B3] hover:text-white transition flex items-center gap-1.5"
            title="الرجوع إلى تجربة التطبيق العامة"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">العودة للتطبيق</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 transition flex items-center gap-1.5"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تسجيل خروج</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop / Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-30 w-64 bg-[#0E1A15] border-l border-[#234235] flex flex-col justify-between pt-16 md:pt-4 md:static md:translate-x-0 transition-transform duration-200 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          }`}
        >
          {/* Nav Items */}
          <div className="p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-right ${
                    isActive
                      ? 'bg-[#2B5742] text-white shadow-md'
                      : 'text-[#A8C2B3] hover:bg-[#162B22] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-[#5A7B6C]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md shrink-0 ${
                        item.badgeColor || 'bg-[#D4AF37] text-[#0F1C16]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin details footer */}
          <div className="p-3 border-t border-[#1F372C] bg-[#0A1410]/50 space-y-2">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-[#1A3328] border border-[#2B5742] flex items-center justify-center text-[#D4AF37] text-xs font-bold font-amiri">
                {authState.admin?.fullName?.[0] || 'م'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#F0F5F2] truncate">
                  {authState.admin?.fullName || 'مشرف النظام'}
                </p>
                <p className="text-[10px] text-[#6E8E7E] truncate">
                  {authState.admin?.email || 'admin@tilawatak.org'}
                </p>
              </div>
            </div>

            <button
              onClick={onBackToApp}
              className="w-full py-2 px-3 bg-[#14241D] hover:bg-[#1A3328] border border-[#234235] rounded-xl text-[11px] font-bold text-[#8BA496] hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <span>معاينة تطبيق أندرويد</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
          />
        )}

        {/* Main Admin Workspace View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboardView onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'submissions' && <AdminSubmissionsView />}
          {activeTab === 'reciters' && <AdminRecitersView />}
          {activeTab === 'recitations' && <AdminRecitationsView />}
          {activeTab === 'announcements' && <AdminAnnouncementsView />}
          {activeTab === 'competitions' && <AdminCompetitionsView />}
          {activeTab === 'rewards' && <AdminRewardsView />}
          {activeTab === 'statistics' && <AdminStatisticsView />}
          {activeTab === 'notifications' && <AdminNotificationsView />}
        </main>
      </div>
    </div>
  );
}
