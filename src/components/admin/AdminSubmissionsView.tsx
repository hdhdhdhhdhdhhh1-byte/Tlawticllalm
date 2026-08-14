import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/AdminService';
import { RecitationSubmission, SubmissionStatus } from '../../types';
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  User,
  Globe,
  BookOpen,
  Volume2,
  AlertCircle,
  RefreshCw,
  Search,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export function AdminSubmissionsView() {
  const [submissions, setSubmissions] = useState<RecitationSubmission[]>([]);
  const [activeFilter, setActiveFilter] = useState<SubmissionStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<RecitationSubmission | null>(null);

  // Review Modal State
  const [reviewMode, setReviewMode] = useState<'approve' | 'reject' | 'hold' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [recitersList, setRecitersList] = useState<any[]>([]);
  const [reciterMode, setReciterMode] = useState<'new' | 'existing'>('new');
  const [selectedReciterId, setSelectedReciterId] = useState('');
  const [isStaffPick, setIsStaffPick] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Local audio preview
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSubmissions(
        activeFilter === 'all' ? undefined : activeFilter
      );
      setSubmissions(data);

      const reciters = await adminService.getAllAdminReciters();
      setRecitersList(reciters);
    } catch (e) {
      console.error('Failed to load submissions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [activeFilter]);

  const toggleAudioPlay = (submission: RecitationSubmission) => {
    if (!submission.audioUrl && !submission.externalAudioUrl) return;
    const url = submission.audioUrl || submission.externalAudioUrl || '';

    if (playingAudioId === submission.id) {
      audioElement?.pause();
      setPlayingAudioId(null);
    } else {
      audioElement?.pause();
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setPlayingAudioId(null);
      setAudioElement(audio);
      setPlayingAudioId(submission.id);
    }
  };

  const handleOpenReview = (submission: RecitationSubmission, mode: 'approve' | 'reject' | 'hold') => {
    setSelectedSubmission(submission);
    setReviewMode(mode);
    setAdminNotes(submission.adminNotes || '');
    setActionError(null);

    // If approving, check if a reciter with identical display_name or pseudonym exists
    const matching = recitersList.find(
      (r) =>
        r.display_name?.toLowerCase() === submission.displayName.toLowerCase() ||
        (submission.pseudonym && r.pseudonym?.toLowerCase() === submission.pseudonym.toLowerCase())
    );
    if (matching) {
      setReciterMode('existing');
      setSelectedReciterId(matching.id);
    } else {
      setReciterMode('new');
      setSelectedReciterId('');
    }
  };

  const handleExecuteApproval = async () => {
    if (!selectedSubmission) return;
    setIsActionLoading(true);
    setActionError(null);

    try {
      const isNew = reciterMode === 'new';
      const [startAyah, endAyah] = selectedSubmission.ayahRange
        .split('-')
        .map((s) => parseInt(s.trim(), 10) || 1);

      await adminService.approveSubmissionAndPublish({
        submission: selectedSubmission,
        reciterId: isNew ? undefined : selectedReciterId,
        createNewReciter: isNew,
        newReciterData: isNew
          ? {
              displayName: selectedSubmission.displayName,
              pseudonym: selectedSubmission.pseudonym,
              usePseudonym: selectedSubmission.usePseudonym,
              gender: selectedSubmission.gender === 'female' ? 'FEMALE' : 'MALE',
              country: selectedSubmission.country,
              bio: `قارئ من ${selectedSubmission.country}`,
              profileImagePath: selectedSubmission.avatarUrl || selectedSubmission.externalImageUrl,
              isVerified: true,
              isFeatured: false,
              isPublished: true
            }
          : undefined,
        recitationData: {
          surahName: selectedSubmission.surahName,
          surahNumber: selectedSubmission.surahNumber,
          ayahStart: startAyah || 1,
          ayahEnd: endAyah || 1,
          riwayah: selectedSubmission.riwayah,
          durationSeconds: selectedSubmission.audioDuration || 180,
          audioStoragePath: selectedSubmission.audioUrl?.includes('storage')
            ? selectedSubmission.audioUrl.split('/object/public/')[1] || selectedSubmission.audioFileName
            : `recitation-audio/${selectedSubmission.id}.mp3`,
          externalAudioUrl: selectedSubmission.externalAudioUrl,
          coverImagePath: selectedSubmission.externalImageUrl,
          description: selectedSubmission.description,
          isStaffPick
        },
        adminNotes
      });

      setReviewMode(null);
      setSelectedSubmission(null);
      await loadSubmissions();
    } catch (e: any) {
      setActionError(e.message || 'فشلت عملية قبول التلاوة');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExecuteRejection = async () => {
    if (!selectedSubmission) return;
    setIsActionLoading(true);
    setActionError(null);

    try {
      await adminService.updateSubmissionStatus(
        selectedSubmission.id,
        'REJECTED',
        adminNotes
      );
      setReviewMode(null);
      setSelectedSubmission(null);
      await loadSubmissions();
    } catch (e: any) {
      setActionError(e.message || 'فشلت عملية رفض الطلب');
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    return (
      sub.displayName.toLowerCase().includes(q) ||
      (sub.pseudonym && sub.pseudonym.toLowerCase().includes(q)) ||
      sub.surahName.toLowerCase().includes(q) ||
      sub.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 select-none font-tajawal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#234235]">
        <div>
          <h1 className="text-xl font-bold font-amiri text-[#F0F5F2] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#D4AF37]" />
            <span>إدارة ومراجعة طلبات التلاوات</span>
          </h1>
          <p className="text-xs text-[#8BA496] mt-0.5">
            تدقيق التلاوات المرفوعة من القراء والتحقق من صحة القراءة والأحكام قبل النشر العام
          </p>
        </div>

        <button
          onClick={loadSubmissions}
          disabled={isLoading}
          className="px-3 py-2 bg-[#162720] hover:bg-[#1E372C] text-[#A8C2B3] hover:text-white rounded-xl border border-[#2B493B] text-xs font-semibold flex items-center gap-1.5 transition self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث الطلبات</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#14241D] border border-[#234235] rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-[#2B5742] text-white shadow-sm'
                : 'text-[#8BA496] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>قيد المراجعة</span>
          </button>

          <button
            onClick={() => setActiveFilter('approved')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeFilter === 'approved'
                ? 'bg-[#2B5742] text-white shadow-sm'
                : 'text-[#8BA496] hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>المقبولة</span>
          </button>

          <button
            onClick={() => setActiveFilter('rejected')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeFilter === 'rejected'
                ? 'bg-[#2B5742] text-white shadow-sm'
                : 'text-[#8BA496] hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>المرفوضة</span>
          </button>

          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-[#2B5742] text-white shadow-sm'
                : 'text-[#8BA496] hover:text-white'
            }`}
          >
            <span>الكل</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، السورة، أو الدولة..."
            className="w-full bg-[#14241D] border border-[#234235] rounded-xl px-3 py-1.5 pr-9 text-xs text-white placeholder-[#5A7B6C] focus:outline-none focus:border-[#3E745A]"
          />
          <Search className="w-4 h-4 text-[#5A7B6C] absolute right-3 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Submissions List / Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#8BA496]">جاري جلب طلبات التلاوة من السحابة...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-16 px-4 bg-[#14241D]/50 border border-dashed border-[#234235] rounded-2xl text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1A3328] border border-[#2B5742] flex items-center justify-center mx-auto text-[#8BA496]">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F0F5F2]">لا توجد طلبات جديدة</h3>
          <p className="text-xs text-[#8BA496] max-w-sm mx-auto">
            {activeFilter === 'pending'
              ? 'جميع التلاوات المرفوعة تمت مراجعتها بنجاح، أو لم يقدم القراء طلبات بعد.'
              : 'لا توجد سجلات تطابق عوامل التصفية الحالية.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 bg-[#14241D] border border-[#234235] rounded-2xl space-y-4 shadow-sm hover:border-[#346950] transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {sub.avatarUrl || sub.externalImageUrl ? (
                      <img
                        src={sub.avatarUrl || sub.externalImageUrl}
                        alt={sub.displayName}
                        className="w-11 h-11 rounded-xl object-cover border border-[#2B5742]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#1A3328] border border-[#2B5742] flex items-center justify-center text-[#4B8569]">
                        <User className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#F0F5F2]">
                          {sub.usePseudonym && sub.pseudonym ? sub.pseudonym : sub.displayName}
                        </h3>
                        {sub.usePseudonym && (
                          <span className="px-1.5 py-0.5 bg-[#1A3328] text-[#8BA496] text-[10px] rounded">
                            اسم مستعار ({sub.displayName})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8BA496] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#4B8569]" />
                          <span>{sub.country}</span>
                        </span>
                        <span>•</span>
                        <span>{sub.gender === 'female' ? 'أنثى' : 'ذكر'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                      sub.status === 'pending'
                        ? 'bg-amber-950/70 border border-amber-800 text-amber-300'
                        : sub.status === 'approved'
                        ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {sub.status === 'pending'
                      ? 'قيد المراجعة'
                      : sub.status === 'approved'
                      ? 'معتمدة ومنشورة'
                      : 'مرفوضة'}
                  </span>
                </div>

                {/* Recitation specifics */}
                <div className="p-3 bg-[#0D1813] border border-[#1F372C] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>سورة {sub.surahName} ({sub.ayahRange})</span>
                    </span>
                    <span className="text-[#8BA496]">رواية {sub.riwayah}</span>
                  </div>

                  {sub.description && (
                    <p className="text-[11px] text-[#A8C2B3] line-clamp-2 italic">
                      "{sub.description}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[#1F372C] text-[10px] text-[#6E8E7E]">
                    <span>تاريخ التقديم: {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</span>
                    {sub.audioFileName && <span>الملف: {sub.audioFileName}</span>}
                  </div>
                </div>

                {/* Admin notes if any */}
                {sub.adminNotes && (
                  <div className="p-2.5 bg-[#1C2C23] border border-[#2B493B] rounded-lg text-xs text-[#A8C2B3] space-y-1">
                    <span className="font-semibold text-[#D4AF37] block">ملاحظات الإدارة:</span>
                    <p className="text-[11px]">{sub.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Actions & Audio preview */}
              <div className="space-y-2 pt-3 border-t border-[#1F372C]">
                {/* Audio preview button */}
                {(sub.audioUrl || sub.externalAudioUrl) && (
                  <button
                    onClick={() => toggleAudioPlay(sub)}
                    className="w-full py-2 px-3 bg-[#1A3328] hover:bg-[#224435] border border-[#2B5742] rounded-xl text-xs font-semibold text-[#D4AF37] flex items-center justify-center gap-2 transition"
                  >
                    {playingAudioId === sub.id ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>إيقاف المعاينة الصوتية</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>الاستماع ومعاينة التلاوة</span>
                      </>
                    )}
                  </button>
                )}

                {/* Admin moderation buttons */}
                {sub.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenReview(sub, 'approve')}
                      className="py-2 px-3 bg-[#2B5742] hover:bg-[#346950] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>قبول ونشر التلاوة</span>
                    </button>

                    <button
                      onClick={() => handleOpenReview(sub, 'reject')}
                      className="py-2 px-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>رفض الطلب</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Approval Modal */}
      {reviewMode && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14241D] border border-[#2B5742] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#234235]">
              <h2 className="text-base font-bold font-amiri text-[#F0F5F2] flex items-center gap-2">
                {reviewMode === 'approve' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>اعتماد ونشر التلاوة في التطبيق</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>رفض طلب التلاوة</span>
                  </>
                )}
              </h2>

              <button
                onClick={() => setReviewMode(null)}
                className="text-[#8BA496] hover:text-white text-xs font-semibold"
              >
                إلغاء
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Approval Details */}
            {reviewMode === 'approve' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#0D1813] border border-[#1F372C] rounded-xl space-y-1">
                  <div className="font-bold text-[#F0F5F2]">
                    سورة {selectedSubmission.surahName} ({selectedSubmission.ayahRange})
                  </div>
                  <div className="text-[#8BA496]">
                    بصوت: {selectedSubmission.displayName} • {selectedSubmission.country}
                  </div>
                </div>

                {/* Reciter linking options */}
                <div className="space-y-2">
                  <label className="block font-semibold text-[#A8C2B3]">
                    ربط التلاوة بملف القارئ:
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReciterMode('new')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        reciterMode === 'new'
                          ? 'bg-[#2B5742] border-[#3E745A] text-white'
                          : 'bg-[#1A3328] border-[#234235] text-[#8BA496]'
                      }`}
                    >
                      إنشاء ملف قارئ جديد
                    </button>

                    <button
                      type="button"
                      onClick={() => setReciterMode('existing')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        reciterMode === 'existing'
                          ? 'bg-[#2B5742] border-[#3E745A] text-white'
                          : 'bg-[#1A3328] border-[#234235] text-[#8BA496]'
                      }`}
                    >
                      ربط بقارئ مسجل مسبقاً
                    </button>
                  </div>

                  {reciterMode === 'existing' && (
                    <div className="space-y-1 pt-1">
                      <select
                        value={selectedReciterId}
                        onChange={(e) => setSelectedReciterId(e.target.value)}
                        className="w-full bg-[#0D1813] border border-[#2B493B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- اختر القارئ من القائمة --</option>
                        {recitersList.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.display_name} ({r.country})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Staff pick option */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="staffPickCheckbox"
                    checked={isStaffPick}
                    onChange={(e) => setIsStaffPick(e.target.checked)}
                    className="rounded border-[#2B5742] bg-[#0D1813] text-[#D4AF37] focus:ring-0"
                  />
                  <label htmlFor="staffPickCheckbox" className="text-xs text-[#E8EFEA] cursor-pointer">
                    تمييز التلاوة ضمن "تلاوات مختارة ومعتمدة" في الصفحة الرئيسية
                  </label>
                </div>

                {/* Admin notes */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#A8C2B3]">
                    ملاحظات الإدارة والتدقيق (اختياري):
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="تمت المراجعة والتأكد من سلامة التلاوة والأحكام..."
                    className="w-full bg-[#0D1813] border border-[#2B493B] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Rejection Details */}
            {reviewMode === 'reject' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#8BA496]">
                  يرجى توضيح سبب الرفض (مثال: جودة الصوت، أخطاء في التجويد، أو نقص في البيانات):
                </p>

                <textarea
                  rows={3}
                  required
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="سبب الرفض للتوثيق الداخلي..."
                  className="w-full bg-[#0D1813] border border-[#2B493B] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#234235]">
              <button
                type="button"
                onClick={() => setReviewMode(null)}
                className="px-4 py-2 bg-[#1A3328] hover:bg-[#224435] text-[#A8C2B3] rounded-xl text-xs font-semibold"
              >
                إلغاء
              </button>

              {reviewMode === 'approve' ? (
                <button
                  type="button"
                  disabled={isActionLoading || (reciterMode === 'existing' && !selectedReciterId)}
                  onClick={handleExecuteApproval}
                  className="px-5 py-2 bg-[#2B5742] hover:bg-[#346950] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>تأكيد الاعتماد والنشر</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleExecuteRejection}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>تأكيد الرفض</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
