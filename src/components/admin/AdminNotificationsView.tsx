import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import { AdminNotification } from '../../types';
import {
  Bell,
  CheckCircle,
  Clock,
  RefreshCw,
  Mail,
  AlertCircle,
  FileCheck,
  Sparkles,
  Info
} from 'lucide-react';

export function AdminNotificationsView() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 select-none font-tajawal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#234235]">
        <div>
          <h1 className="text-xl font-bold font-amiri text-[#F0F5F2] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#D4AF37]" />
            <span>تنبيهات وإشعارات النظام</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#D4AF37] text-[#0F1C16] text-[11px] font-bold rounded-full">
                {unreadCount} جديد
              </span>
            )}
          </h1>
          <p className="text-xs text-[#8BA496] mt-0.5">
            سجل الإشعارات الإدارية والتنبيهات عند إرسال تلاوات جديدة للمراجعة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-2 bg-[#1A3328] hover:bg-[#224435] text-[#34D399] rounded-xl text-xs font-bold border border-[#2B5742] transition"
            >
              تحديد الكل كمقروء
            </button>
          )}

          <button
            onClick={loadNotifications}
            disabled={isLoading}
            className="p-2 bg-[#162720] hover:bg-[#1E372C] text-[#A8C2B3] rounded-xl border border-[#2B493B] transition"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#8BA496]">جاري جلب التنبيهات الإدارية...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 px-4 bg-[#14241D]/50 border border-dashed border-[#234235] rounded-2xl text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1A3328] border border-[#2B5742] flex items-center justify-center mx-auto text-[#8BA496]">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F0F5F2]">لا توجد إشعارات حالياً</h3>
          <p className="text-xs text-[#8BA496] max-w-sm mx-auto">
            ستظهر هنا التنبيهات الفورية عند رفع أي قارئ لتلاوة جديدة أو عند إتمام مهام المراجعة.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                item.isRead
                  ? 'bg-[#14241D] border-[#1F372C] opacity-75'
                  : 'bg-[#1A3328] border-[#3D6E58] shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.isRead
                      ? 'bg-[#0D1813] text-[#8BA496]'
                      : 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                  }`}
                >
                  {item.notificationType === 'NEW_SUBMISSION' ? (
                    <FileCheck className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-[#F0F5F2]">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                    )}
                  </div>
                  <p className="text-xs text-[#A8C2B3] leading-relaxed">{item.content}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#6E8E7E]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleString('ar-EG')}</span>
                  </div>
                </div>
              </div>

              {!item.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(item.id);
                  }}
                  className="text-xs text-[#34D399] hover:underline shrink-0"
                >
                  تحديد كمقروء
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
