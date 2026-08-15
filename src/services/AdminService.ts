import {
  AdminProfile,
  AdminAuthState,
  AdminDashboardStats,
  RecitationSubmission,
  Reciter,
  Recitation,
  Announcement,
  Competition,
  RewardDefinition,
  ReciterHonor,
  AdminNotification,
  SubmissionStatus
} from '../types';
import { SUPABASE_CONFIG } from './SupabaseService';

export interface AdminAuthDiagnostic {
  authHttpStatus?: number;
  profileHttpStatus?: number;
  authenticatedUserId?: string | null;
  adminProfileId?: string | null;
  adminRole?: string | null;
  isActive?: boolean | string | number | null;
  profilesFoundCount?: number;
}

export interface IsAdminRpcDiagnostic {
  context: string;
  timestamp: string;
  authenticatedUserId: string | null;
  rpcHttpStatus: number | null;
  rpcResponse: any;
  isAdmin: boolean;
  adminProfileId: string | null;
  adminRole: string | null;
  isActive: boolean | string | number | null;
}

export interface PostRequestDiagnostic {
  endpoint: string;
  method: string;
  httpStatus: number | null;
  responseBody: any;
  authenticatedUserId: string | null;
  isAdminBeforePost: boolean | null;
  isAdminAfterPost: boolean | null;
  timestamp: string;
}

const ADMIN_STORAGE_KEY = 'tilawatak_admin_session';

class AdminServiceImpl {
  private authState: AdminAuthState = {
    isAuthenticated: false,
    token: null,
    admin: null
  };

  private listeners: Set<(state: AdminAuthState) => void> = new Set();
  private diagnosticListeners: Set<(diag: IsAdminRpcDiagnostic | null) => void> = new Set();
  private postDiagnosticListeners: Set<(diag: PostRequestDiagnostic | null) => void> = new Set();
  private latestRpcDiagnostic: IsAdminRpcDiagnostic | null = null;
  private latestPostDiagnostic: PostRequestDiagnostic | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const saved = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.token && parsed.admin) {
          this.authState = {
            isAuthenticated: true,
            token: parsed.token,
            admin: parsed.admin
          };
        }
      }
    } catch (e) {
      console.warn('Failed to restore admin session:', e);
    }
  }

  private saveSession(token: string, admin: AdminProfile) {
    this.authState = {
      isAuthenticated: true,
      token,
      admin
    };
    try {
      sessionStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({ token, admin })
      );
    } catch (e) {
      console.warn('Failed to save admin session:', e);
    }
    this.notifyListeners();
  }

  private clearSession() {
    this.authState = {
      isAuthenticated: false,
      token: null,
      admin: null
    };
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear admin session:', e);
    }
    this.notifyListeners();
  }

  subscribe(listener: (state: AdminAuthState) => void) {
    this.listeners.add(listener);
    listener(this.authState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.authState));
  }

  getAuthState(): AdminAuthState {
    return this.authState;
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      apikey: SUPABASE_CONFIG.anonKey,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    if (this.authState.token) {
      headers['Authorization'] = `Bearer ${this.authState.token}`;
    } else {
      headers['Authorization'] = `Bearer ${SUPABASE_CONFIG.anonKey}`;
    }

    return headers;
  }

  subscribeDiagnostic(listener: (diag: IsAdminRpcDiagnostic | null) => void) {
    this.diagnosticListeners.add(listener);
    listener(this.latestRpcDiagnostic);
    return () => {
      this.diagnosticListeners.delete(listener);
    };
  }

  private notifyDiagnosticListeners() {
    this.diagnosticListeners.forEach((l) => l(this.latestRpcDiagnostic));
  }

  getLatestRpcDiagnostic(): IsAdminRpcDiagnostic | null {
    return this.latestRpcDiagnostic;
  }

  subscribePostDiagnostic(listener: (diag: PostRequestDiagnostic | null) => void) {
    this.postDiagnosticListeners.add(listener);
    listener(this.latestPostDiagnostic);
    return () => {
      this.postDiagnosticListeners.delete(listener);
    };
  }

  private notifyPostDiagnosticListeners() {
    this.postDiagnosticListeners.forEach((l) => l(this.latestPostDiagnostic));
  }

  getLatestPostDiagnostic(): PostRequestDiagnostic | null {
    return this.latestPostDiagnostic;
  }

  // ============================================================================
  // DIAGNOSTICS
  // ============================================================================

  /**
   * Development-only diagnostic calling the public RPC is_admin() using the current access token.
   * Logs and stores strictly non-sensitive fields: status, response, user ID, boolean result.
   */
  async checkIsAdminRpc(context: string = 'diagnostic'): Promise<boolean | null> {
    if (typeof window === 'undefined' || !(import.meta as any).env?.DEV) return null;
    const admin = this.authState.admin;
    const authUserId = admin?.id || null;

    if (!this.authState.token) {
      const diag: IsAdminRpcDiagnostic = {
        context,
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        authenticatedUserId: authUserId,
        rpcHttpStatus: null,
        rpcResponse: 'No token in session',
        isAdmin: false,
        adminProfileId: admin?.id || null,
        adminRole: admin?.role || null,
        isActive: admin?.isActive ?? null
      };
      this.latestRpcDiagnostic = diag;
      this.notifyDiagnosticListeners();
      console.log(`[is_admin Diagnostic - ${context}]`, diag);
      return false;
    }

    try {
      const rpcRes = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/rpc/is_admin`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_CONFIG.anonKey,
          Authorization: `Bearer ${this.authState.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({})
      });

      const rpcHttpStatus = rpcRes.status;
      let rpcResponse: any = null;
      try {
        rpcResponse = await rpcRes.json();
      } catch {
        rpcResponse = await rpcRes.text().catch(() => null);
      }

      const isAdmin = rpcResponse === true || rpcResponse === 'true';

      const diag: IsAdminRpcDiagnostic = {
        context,
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        authenticatedUserId: authUserId,
        rpcHttpStatus,
        rpcResponse,
        isAdmin,
        adminProfileId: admin?.id || null,
        adminRole: admin?.role || null,
        isActive: admin?.isActive ?? null
      };

      this.latestRpcDiagnostic = diag;
      this.notifyDiagnosticListeners();

      console.log(`[is_admin Diagnostic - ${context}]`, diag);

      return isAdmin;
    } catch (e: any) {
      const diag: IsAdminRpcDiagnostic = {
        context,
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        authenticatedUserId: authUserId,
        rpcHttpStatus: null,
        rpcResponse: e?.message || 'Network error',
        isAdmin: false,
        adminProfileId: admin?.id || null,
        adminRole: admin?.role || null,
        isActive: admin?.isActive ?? null
      };
      this.latestRpcDiagnostic = diag;
      this.notifyDiagnosticListeners();

      console.warn(`[is_admin Diagnostic - ${context}] Error calling RPC is_admin:`, diag);
      return null;
    }
  }

  // ============================================================================
  // 1. ADMIN AUTHENTICATION
  // ============================================================================

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; diagnostic?: AdminAuthDiagnostic }> {
    try {
      this.clearSession(); // Clear any previous stale session before authentication

      const cleanEmail = email.trim().toLowerCase();

      // 1. Supabase Auth token request
      const authRes = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_CONFIG.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      if (!authRes.ok) {
        const errJson = await authRes.json().catch(() => ({}));
        const message = errJson.error_description || errJson.msg || errJson.message || 'بيانات الدخول غير صحيحة';
        return {
          success: false,
          error: message,
          diagnostic: {
            authHttpStatus: authRes.status,
            profileHttpStatus: undefined,
            authenticatedUserId: null,
            adminProfileId: null,
            adminRole: null,
            isActive: null,
            profilesFoundCount: 0
          }
        };
      }

      const authData = await authRes.json();
      const accessToken = authData.access_token;
      const userId = authData.user?.id;
      const userEmail = (authData.user?.email || cleanEmail).toLowerCase();

      if (!accessToken || !userId) {
        return {
          success: false,
          error: 'تعذر التحقق من جلسة المستخدم',
          diagnostic: {
            authHttpStatus: authRes.status,
            profileHttpStatus: undefined,
            authenticatedUserId: userId || null,
            adminProfileId: null,
            adminRole: null,
            isActive: null,
            profilesFoundCount: 0
          }
        };
      }

      // 2. Query admin_profiles by ID with authenticated Bearer token
      let profileRes = await fetch(
        `${SUPABASE_CONFIG.restBaseUrl}/admin_profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
        {
          headers: {
            apikey: SUPABASE_CONFIG.anonKey,
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        }
      );

      let profiles: any[] = [];
      if (profileRes.ok) {
        const resData = await profileRes.json().catch(() => []);
        if (Array.isArray(resData)) {
          profiles = resData;
        }
      }

      // Fallback query if id filter returned empty (e.g. by email)
      if (profiles.length === 0) {
        const fallbackRes = await fetch(
          `${SUPABASE_CONFIG.restBaseUrl}/admin_profiles?email=ilike.${encodeURIComponent(userEmail)}&select=*`,
          {
            headers: {
              apikey: SUPABASE_CONFIG.anonKey,
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json'
            }
          }
        );
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json().catch(() => []);
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            profiles = fallbackData;
            profileRes = fallbackRes;
          }
        }
      }

      // Find matching profile by ID or email
      const profile = profiles.find(
        (p: any) => p.id === userId || (p.email && p.email.toLowerCase() === userEmail)
      ) || (profiles.length > 0 ? profiles[0] : null);

      const diagnosticData: AdminAuthDiagnostic = {
        authHttpStatus: authRes.status,
        profileHttpStatus: profileRes.status,
        authenticatedUserId: userId || null,
        adminProfileId: profile?.id || null,
        adminRole: profile?.role || null,
        isActive: profile ? (profile.is_active ?? null) : null,
        profilesFoundCount: profiles.length
      };

      // Safe development diagnostic log (no secrets or passwords)
      if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
        console.log('[Admin Auth Diagnostic]', diagnosticData);
      }

      if (!profile) {
        return {
          success: false,
          error: 'هذا الحساب ليس لديه صلاحيات الإدارة',
          diagnostic: diagnosticData
        };
      }

      const isActive =
        profile.is_active === true ||
        profile.is_active === 'true' ||
        profile.is_active === 1 ||
        profile.is_active === 't';

      if (!isActive) {
        return {
          success: false,
          error: 'تم تعطيل هذا الحساب الإداري، يرجى مراجعة المسؤول',
          diagnostic: diagnosticData
        };
      }

      const adminProfile: AdminProfile = {
        id: profile.id,
        email: profile.email || userEmail,
        fullName: profile.full_name || 'مدير المنصة',
        role: profile.role || 'SUPER_ADMIN',
        isActive: true,
        createdAt: profile.created_at || new Date().toISOString()
      };

      this.saveSession(accessToken, adminProfile);

      // Development-only diagnostic call to public RPC is_admin() using the access token
      if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
        this.checkIsAdminRpc('post-login');
      }

      return { success: true };
    } catch (e: any) {
      console.error('Admin login error:', e);
      return { success: false, error: e.message || 'حدث خطأ أثناء الاتصال بالخادم' };
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.authState.token) {
        await fetch(`${SUPABASE_CONFIG.url}/auth/v1/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        }).catch(() => {});
      }
    } finally {
      this.clearSession();
    }
  }

  // ============================================================================
  // 2. DASHBOARD STATS
  // ============================================================================

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const headers = { ...this.getAuthHeaders(), Prefer: 'count=exact' };

    try {
      const [
        recitersRes,
        pubRecitersRes,
        recitationsRes,
        pubRecitationsRes,
        pendingSubmissionsRes,
        listensRes,
        likesRes,
        competitionsRes
      ] = await Promise.all([
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciters?select=id`, { headers }),
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciters?is_published=eq.true&select=id`, { headers }),
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitations?select=id`, { headers }),
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitations?status=eq.APPROVED&select=id`, { headers }),
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitation_submissions?status=eq.PENDING&select=id`, { headers }),
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/listen_events?select=id`, { headers }),
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/likes?select=recitation_id`, { headers }),
        fetch(`${SUPABASE_CONFIG.restBaseUrl}/competitions?is_published=eq.true&select=id`, { headers })
      ]);

      const parseCount = (res: Response): number => {
        const range = res.headers.get('content-range');
        if (range && range.includes('/')) {
          const total = range.split('/')[1];
          if (total && total !== '*') return parseInt(total, 10) || 0;
        }
        return 0;
      };

      return {
        totalReciters: parseCount(recitersRes),
        publishedReciters: parseCount(pubRecitersRes),
        totalRecitations: parseCount(recitationsRes),
        publishedRecitations: parseCount(pubRecitationsRes),
        pendingSubmissions: parseCount(pendingSubmissionsRes),
        totalListens: parseCount(listensRes),
        totalLikes: parseCount(likesRes),
        activeCompetitions: parseCount(competitionsRes)
      };
    } catch (e) {
      console.error('Failed to fetch dashboard stats:', e);
      return {
        totalReciters: 0,
        publishedReciters: 0,
        totalRecitations: 0,
        publishedRecitations: 0,
        pendingSubmissions: 0,
        totalListens: 0,
        totalLikes: 0,
        activeCompetitions: 0
      };
    }
  }

  // ============================================================================
  // 3. RECITATION SUBMISSIONS MODERATION
  // ============================================================================

  async getSubmissions(status?: SubmissionStatus): Promise<RecitationSubmission[]> {
    let url = `${SUPABASE_CONFIG.restBaseUrl}/recitation_submissions?select=*&order=created_at.desc`;
    if (status) {
      url += `&status=eq.${status.toUpperCase()}`;
    }

    const res = await fetch(url, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();

    return rows.map((r: any) => ({
      id: r.id,
      displayName: r.display_name,
      pseudonym: r.pseudonym,
      usePseudonym: r.use_pseudonym,
      gender: r.gender === 'FEMALE' ? 'female' : 'male',
      country: r.country,
      avatarUrl: r.profile_image_path,
      surahNumber: r.surah_number,
      surahName: r.surah_name,
      ayahRange: `${r.ayah_start} - ${r.ayah_end}`,
      riwayah: r.riwayah,
      description: r.description || '',
      audioFileName: r.audio_storage_path?.split('/').pop() || 'recording.mp3',
      audioDuration: 0,
      audioUrl: r.external_audio_url || `${SUPABASE_CONFIG.storageBaseUrl}/object/public/${r.audio_storage_path}`,
      externalAudioUrl: r.external_audio_url,
      externalImageUrl: r.profile_image_path,
      agreeToTerms: true,
      submittedAt: r.created_at,
      status: r.status?.toLowerCase() as SubmissionStatus,
      adminNotes: r.admin_notes
    }));
  }

  async updateSubmissionStatus(
    submissionId: string,
    status: 'APPROVED' | 'REJECTED' | 'PENDING',
    adminNotes?: string
  ): Promise<void> {
    const res = await fetch(
      `${SUPABASE_CONFIG.restBaseUrl}/recitation_submissions?id=eq.${encodeURIComponent(submissionId)}`,
      {
        method: 'PATCH',
        headers: {
          ...this.getAuthHeaders(),
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: this.authState.admin?.id || null
        })
      }
    );
    if (!res.ok) throw new Error(`Failed to update submission status (HTTP ${res.status})`);
  }

  async approveSubmissionAndPublish(params: {
    submission: RecitationSubmission;
    reciterId?: string;
    createNewReciter?: boolean;
    newReciterData?: {
      displayName: string;
      pseudonym?: string;
      usePseudonym: boolean;
      gender: 'MALE' | 'FEMALE';
      country: string;
      bio: string;
      profileImagePath?: string;
      isVerified: boolean;
      isFeatured: boolean;
      isPublished: boolean;
    };
    recitationData: {
      surahName: string;
      surahNumber: number;
      ayahStart: number;
      ayahEnd: number;
      riwayah: string;
      durationSeconds: number;
      audioStoragePath: string;
      externalAudioUrl?: string;
      coverImagePath?: string;
      description?: string;
      isStaffPick: boolean;
    };
    adminNotes?: string;
  }): Promise<{ reciterId: string; recitationId: string }> {
    let finalReciterId = params.reciterId;

    // 1. Create new reciter if requested
    if (params.createNewReciter && params.newReciterData) {
      if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
        await this.checkIsAdminRpc('approveSubmission-before-POST-reciters');
      }

      const reciterRes = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciters`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          display_name: params.newReciterData.displayName,
          pseudonym: params.newReciterData.pseudonym || null,
          use_pseudonym: params.newReciterData.usePseudonym,
          gender: params.newReciterData.gender,
          country: params.newReciterData.country,
          bio: params.newReciterData.bio,
          profile_image_path: params.newReciterData.profileImagePath || null,
          is_verified: params.newReciterData.isVerified,
          is_featured: params.newReciterData.isFeatured,
          is_published: params.newReciterData.isPublished
        })
      });

      if (!reciterRes.ok) {
        if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
          await this.checkIsAdminRpc(`approveSubmission-POST-reciters-failed-HTTP-${reciterRes.status}`);
        }
        throw new Error(`Failed to create reciter (HTTP ${reciterRes.status})`);
      }
      const newReciters = await reciterRes.json();
      finalReciterId = newReciters[0].id;
    }

    if (!finalReciterId) {
      throw new Error('يجب تحديد القارئ أو إنشاء قارئ جديد للمتابعة');
    }

    // 2. Create recitation entry
    const recitationRes = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitations`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        reciter_id: finalReciterId,
        surah_name: params.recitationData.surahName,
        surah_number: params.recitationData.surahNumber,
        ayah_start: params.recitationData.ayahStart,
        ayah_end: params.recitationData.ayahEnd,
        riwayah: params.recitationData.riwayah,
        duration_seconds: params.recitationData.durationSeconds || 180,
        audio_storage_path: params.recitationData.audioStoragePath,
        external_audio_url: params.recitationData.externalAudioUrl || null,
        cover_image_path: params.recitationData.coverImagePath || null,
        description: params.recitationData.description || null,
        status: 'APPROVED',
        is_staff_pick: params.recitationData.isStaffPick,
        published_at: new Date().toISOString()
      })
    });

    if (!recitationRes.ok) {
      throw new Error(`Failed to publish recitation (HTTP ${recitationRes.status})`);
    }

    const newRecitations = await recitationRes.json();
    const recitationId = newRecitations[0].id;

    // 3. Mark submission as approved
    await this.updateSubmissionStatus(params.submission.id, 'APPROVED', params.adminNotes);

    return { reciterId: finalReciterId, recitationId };
  }

  // ============================================================================
  // 4. RECITERS MANAGEMENT
  // ============================================================================

  async getAllAdminReciters(): Promise<any[]> {
    const url = `${SUPABASE_CONFIG.restBaseUrl}/reciters?select=*&order=created_at.desc`;
    const authHeaders = this.getAuthHeaders();

    if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
      console.log('[GET /reciters Diagnostic Before Request]', {
        url,
        hasAuthorizationHeader: !!authHeaders['Authorization'],
        headers: Object.keys(authHeaders)
      });
    }

    const res = await fetch(url, {
      headers: authHeaders
    });

    if (!res.ok) {
      if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
        console.error('[GET /reciters Failed]', {
          status: res.status,
          statusText: res.statusText
        });
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
      console.log('[GET /reciters Diagnostic After Request]', {
        url,
        httpStatus: res.status,
        recordsCount: Array.isArray(data) ? data.length : 0,
        responseBody: data
      });
    }

    return data;
  }

  async createReciter(data: {
    displayName: string;
    pseudonym?: string;
    usePseudonym: boolean;
    gender: 'MALE' | 'FEMALE';
    country: string;
    bio: string;
    profileImagePath?: string;
    isVerified: boolean;
    isFeatured: boolean;
    isPublished: boolean;
  }): Promise<any> {
    let isAdminBefore: boolean | null = null;
    let rpcHttpStatusBefore: number | null = null;

    const authenticatedUserId = this.authState.admin?.id || null;
    const hasAccessToken = !!this.authState.token;

    if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
      isAdminBefore = await this.checkIsAdminRpc('before-POST-reciters');
      const latestRpc = this.getLatestRpcDiagnostic();
      rpcHttpStatusBefore = latestRpc?.rpcHttpStatus ?? null;

      console.log('AUTH CONTEXT BEFORE INSERT', {
        authenticatedUserId,
        hasAccessToken,
        rpcHttpStatus: rpcHttpStatusBefore,
        rpcIsAdmin: isAdminBefore
      });
    }

    const authHeaders = this.getAuthHeaders();

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciters`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        display_name: data.displayName,
        pseudonym: data.pseudonym || null,
        use_pseudonym: data.usePseudonym,
        gender: data.gender,
        country: data.country,
        bio: data.bio,
        profile_image_path: data.profileImagePath || null,
        is_verified: data.isVerified,
        is_featured: data.isFeatured,
        is_published: data.isPublished
      })
    });

    if (!res.ok) {
      let errBody: any = null;
      try {
        errBody = await res.json();
      } catch {
        errBody = await res.text().catch(() => null);
      }

      const errorMsg =
        errBody?.message ||
        errBody?.msg ||
        errBody?.error_description ||
        `Failed to create reciter (HTTP ${res.status})`;

      throw new Error(errorMsg);
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      return { success: true };
    }
    try {
      const json = JSON.parse(text);
      return Array.isArray(json) ? json[0] : json;
    } catch {
      return { success: true };
    }
  }

  async updateReciter(
    id: string,
    data: Partial<{
      displayName: string;
      pseudonym: string | null;
      usePseudonym: boolean;
      gender: 'MALE' | 'FEMALE';
      country: string;
      bio: string;
      profileImagePath: string | null;
      isVerified: boolean;
      isFeatured: boolean;
      isPublished: boolean;
    }>
  ): Promise<void> {
    const payload: Record<string, any> = {};
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.pseudonym !== undefined) payload.pseudonym = data.pseudonym;
    if (data.usePseudonym !== undefined) payload.use_pseudonym = data.usePseudonym;
    if (data.gender !== undefined) payload.gender = data.gender;
    if (data.country !== undefined) payload.country = data.country;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.profileImagePath !== undefined) payload.profile_image_path = data.profileImagePath;
    if (data.isVerified !== undefined) payload.is_verified = data.isVerified;
    if (data.isFeatured !== undefined) payload.is_featured = data.isFeatured;
    if (data.isPublished !== undefined) payload.is_published = data.isPublished;

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciters?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update reciter (HTTP ${res.status})`);
  }

  async deleteReciter(id: string): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciters?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete reciter (HTTP ${res.status})`);
  }

  // ============================================================================
  // 5. RECITATIONS MANAGEMENT
  // ============================================================================

  async getAllAdminRecitations(reciterId?: string): Promise<any[]> {
    let url = `${SUPABASE_CONFIG.restBaseUrl}/recitations?select=*,reciters(display_name,pseudonym,country,profile_image_path)&order=created_at.desc`;
    if (reciterId) {
      url += `&reciter_id=eq.${encodeURIComponent(reciterId)}`;
    }
    const res = await fetch(url, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async createRecitation(data: {
    reciterId: string;
    surahName: string;
    surahNumber: number;
    ayahStart: number;
    ayahEnd: number;
    riwayah: string;
    durationSeconds: number;
    audioStoragePath: string;
    externalAudioUrl?: string;
    coverImagePath?: string;
    description?: string;
    isStaffPick: boolean;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
  }): Promise<any> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitations`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        reciter_id: data.reciterId,
        surah_name: data.surahName,
        surah_number: data.surahNumber,
        ayah_start: data.ayahStart,
        ayah_end: data.ayahEnd,
        riwayah: data.riwayah,
        duration_seconds: data.durationSeconds,
        audio_storage_path: data.audioStoragePath,
        external_audio_url: data.externalAudioUrl || null,
        cover_image_path: data.coverImagePath || null,
        description: data.description || null,
        is_staff_pick: data.isStaffPick,
        status: data.status,
        published_at: data.status === 'APPROVED' ? new Date().toISOString() : null
      })
    });
    if (!res.ok) throw new Error(`Failed to create recitation (HTTP ${res.status})`);
    const json = await res.json();
    return json[0];
  }

  async updateRecitation(
    id: string,
    data: Partial<{
      reciterId: string;
      surahName: string;
      surahNumber: number;
      ayahStart: number;
      ayahEnd: number;
      riwayah: string;
      durationSeconds: number;
      audioStoragePath: string;
      externalAudioUrl: string | null;
      coverImagePath: string | null;
      description: string | null;
      isStaffPick: boolean;
      status: 'APPROVED' | 'PENDING' | 'REJECTED';
    }>
  ): Promise<void> {
    const payload: Record<string, any> = {};
    if (data.reciterId !== undefined) payload.reciter_id = data.reciterId;
    if (data.surahName !== undefined) payload.surah_name = data.surahName;
    if (data.surahNumber !== undefined) payload.surah_number = data.surahNumber;
    if (data.ayahStart !== undefined) payload.ayah_start = data.ayahStart;
    if (data.ayahEnd !== undefined) payload.ayah_end = data.ayahEnd;
    if (data.riwayah !== undefined) payload.riwayah = data.riwayah;
    if (data.durationSeconds !== undefined) payload.duration_seconds = data.durationSeconds;
    if (data.audioStoragePath !== undefined) payload.audio_storage_path = data.audioStoragePath;
    if (data.externalAudioUrl !== undefined) payload.external_audio_url = data.externalAudioUrl;
    if (data.coverImagePath !== undefined) payload.cover_image_path = data.coverImagePath;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isStaffPick !== undefined) payload.is_staff_pick = data.isStaffPick;
    if (data.status !== undefined) {
      payload.status = data.status;
      if (data.status === 'APPROVED') {
        payload.published_at = new Date().toISOString();
      }
    }

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitations?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update recitation (HTTP ${res.status})`);
  }

  async deleteRecitation(id: string): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/recitations?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete recitation (HTTP ${res.status})`);
  }

  // ============================================================================
  // 6. ANNOUNCEMENTS
  // ============================================================================

  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/announcements?select=*&order=created_at.desc`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      imagePath: r.image_path,
      isPublished: r.is_published,
      publishedAt: r.published_at,
      createdAt: r.created_at
    }));
  }

  async createAnnouncement(data: {
    title: string;
    body: string;
    imagePath?: string;
    isPublished: boolean;
  }): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/announcements`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        title: data.title,
        body: data.body,
        image_path: data.imagePath || null,
        is_published: data.isPublished,
        published_at: data.isPublished ? new Date().toISOString() : null
      })
    });
    if (!res.ok) throw new Error(`Failed to create announcement (HTTP ${res.status})`);
  }

  async updateAnnouncement(
    id: string,
    data: Partial<{
      title: string;
      body: string;
      imagePath: string | null;
      isPublished: boolean;
    }>
  ): Promise<void> {
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.body !== undefined) payload.body = data.body;
    if (data.imagePath !== undefined) payload.image_path = data.imagePath;
    if (data.isPublished !== undefined) {
      payload.is_published = data.isPublished;
      if (data.isPublished) payload.published_at = new Date().toISOString();
    }

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/announcements?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update announcement (HTTP ${res.status})`);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/announcements?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete announcement (HTTP ${res.status})`);
  }

  // ============================================================================
  // 7. COMPETITIONS
  // ============================================================================

  async getCompetitions(): Promise<Competition[]> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/competitions?select=*&order=created_at.desc`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imagePath: r.image_path,
      startAt: r.start_at,
      endAt: r.end_at,
      isPublished: r.is_published,
      createdAt: r.created_at
    }));
  }

  async createCompetition(data: {
    title: string;
    description: string;
    imagePath?: string;
    startAt: string;
    endAt: string;
    isPublished: boolean;
  }): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/competitions`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        image_path: data.imagePath || null,
        start_at: data.startAt,
        end_at: data.endAt,
        is_published: data.isPublished
      })
    });
    if (!res.ok) throw new Error(`Failed to create competition (HTTP ${res.status})`);
  }

  async updateCompetition(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      imagePath: string | null;
      startAt: string;
      endAt: string;
      isPublished: boolean;
    }>
  ): Promise<void> {
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.imagePath !== undefined) payload.image_path = data.imagePath;
    if (data.startAt !== undefined) payload.start_at = data.startAt;
    if (data.endAt !== undefined) payload.end_at = data.endAt;
    if (data.isPublished !== undefined) payload.is_published = data.isPublished;

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/competitions?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update competition (HTTP ${res.status})`);
  }

  async deleteCompetition(id: string): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/competitions?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete competition (HTTP ${res.status})`);
  }

  // ============================================================================
  // 8. REWARDS & HONORS
  // ============================================================================

  async getRewardDefinitions(): Promise<RewardDefinition[]> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reward_definitions?select=*&order=created_at.desc`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      description: r.description,
      category: r.category,
      badgeIconPath: r.badge_icon_path,
      isActive: r.is_active,
      createdAt: r.created_at
    }));
  }

  async createRewardDefinition(data: {
    code?: string;
    title: string;
    description: string;
    category?: 'TAJWEED_EXCELLENCE' | 'COMMUNITY_FAVORITE' | 'MILESTONE_COMPLETION' | 'EDITORIAL_HONOR' | string;
    badgeIconPath?: string;
    iconName?: string;
    pointsValue?: number;
  }): Promise<void> {
    const code = data.code || `HONOR_${Date.now().toString(36).toUpperCase()}`;
    const category = (data.category && ['TAJWEED_EXCELLENCE', 'COMMUNITY_FAVORITE', 'MILESTONE_COMPLETION', 'EDITORIAL_HONOR'].includes(data.category))
      ? data.category
      : 'EDITORIAL_HONOR';

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reward_definitions`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        code,
        title: data.title,
        description: data.description,
        category,
        badge_icon_path: data.badgeIconPath || data.iconName || null,
        is_active: true
      })
    });
    if (!res.ok) throw new Error(`Failed to create reward definition (HTTP ${res.status})`);
  }

  async updateRewardDefinition(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      iconName: string;
      badgeIconPath: string;
      pointsValue: number;
      isActive: boolean;
    }>
  ): Promise<void> {
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category !== undefined) {
      if (['TAJWEED_EXCELLENCE', 'COMMUNITY_FAVORITE', 'MILESTONE_COMPLETION', 'EDITORIAL_HONOR'].includes(data.category)) {
        payload.category = data.category;
      }
    }
    if (data.badgeIconPath !== undefined || data.iconName !== undefined) {
      payload.badge_icon_path = data.badgeIconPath || data.iconName;
    }
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reward_definitions?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update reward definition (HTTP ${res.status})`);
  }

  async deleteRewardDefinition(id: string): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reward_definitions?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`Failed to delete reward definition (HTTP ${res.status})`);
  }

  async getReciterHonors(reciterId?: string): Promise<ReciterHonor[]> {
    let url = `${SUPABASE_CONFIG.restBaseUrl}/reciter_honors?select=*,reward_definitions(*),reciters(display_name,pseudonym,country,profile_image_path)&order=awarded_at.desc`;
    if (reciterId) {
      url += `&reciter_id=eq.${encodeURIComponent(reciterId)}`;
    }
    const res = await fetch(url, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map((r: any) => ({
      id: r.id,
      reciterId: r.reciter_id,
      rewardId: r.reward_id,
      awardedAt: r.awarded_at,
      awardedBy: r.awarded_by,
      citationNote: r.citation_note,
      reciter: r.reciters
        ? {
            id: r.reciter_id,
            displayName: r.reciters.display_name,
            pseudonym: r.reciters.pseudonym,
            country: r.reciters.country,
            profileImagePath: r.reciters.profile_image_path
          }
        : undefined,
      reward: r.reward_definitions
        ? {
            id: r.reward_definitions.id,
            code: r.reward_definitions.code,
            title: r.reward_definitions.title,
            description: r.reward_definitions.description,
            category: r.reward_definitions.category,
            badgeIconPath: r.reward_definitions.badge_icon_path,
            isActive: r.reward_definitions.is_active,
            createdAt: r.reward_definitions.created_at
          }
        : undefined
    }));
  }

  async getHonors(reciterId?: string): Promise<any[]> {
    return this.getReciterHonors(reciterId);
  }

  async awardHonorToReciter(
    reciterIdOrParams:
      | string
      | {
          reciterId: string;
          rewardDefinitionId?: string;
          rewardId?: string;
          honorTitle?: string;
          citationNote?: string;
        },
    rewardId?: string,
    citationNote?: string
  ): Promise<void> {
    let finalReciterId: string;
    let finalRewardId: string | null = null;
    let finalNote: string | null = null;

    if (typeof reciterIdOrParams === 'object') {
      finalReciterId = reciterIdOrParams.reciterId;
      finalRewardId = reciterIdOrParams.rewardDefinitionId || reciterIdOrParams.rewardId || null;
      finalNote = reciterIdOrParams.citationNote || reciterIdOrParams.honorTitle || null;
    } else {
      finalReciterId = reciterIdOrParams;
      finalRewardId = rewardId || null;
      finalNote = citationNote || null;
    }

    if (!finalRewardId) {
      // If reward definition is not given, fetch the first available or create a default honor
      const defs = await this.getRewardDefinitions();
      if (defs.length > 0) {
        finalRewardId = defs[0].id;
      }
    }

    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciter_honors`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        reciter_id: finalReciterId,
        reward_id: finalRewardId,
        citation_note: finalNote,
        awarded_by: this.authState.admin?.id || null
      })
    });
    if (!res.ok) throw new Error(`Failed to award honor (HTTP ${res.status})`);
  }

  async revokeHonor(honorId: string): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/reciter_honors?id=eq.${encodeURIComponent(honorId)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`Failed to revoke honor (HTTP ${res.status})`);
  }

  // ============================================================================
  // 9. ADMIN NOTIFICATIONS
  // ============================================================================

  async getAdminNotifications(): Promise<AdminNotification[]> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/admin_notifications?select=*&order=created_at.desc`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map((r: any) => ({
      id: r.id,
      notificationType: r.notification_type,
      title: r.title,
      content: r.content,
      referenceId: r.reference_id,
      isRead: r.is_read,
      sentViaEmail: r.sent_via_email,
      createdAt: r.created_at
    }));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/admin_notifications?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_read: true })
    });
    if (!res.ok) throw new Error(`Failed to mark notification read (HTTP ${res.status})`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const res = await fetch(`${SUPABASE_CONFIG.restBaseUrl}/admin_notifications?is_read=eq.false`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_read: true })
    });
    if (!res.ok) throw new Error(`Failed to mark all notifications read (HTTP ${res.status})`);
  }

  // ============================================================================
  // 10. STORAGE UPLOAD
  // ============================================================================

  async uploadFile(bucket: string, path: string, file: File | Blob): Promise<string> {
    const headers: Record<string, string> = {
      apikey: SUPABASE_CONFIG.anonKey
    };
    if (this.authState.token) {
      headers['Authorization'] = `Bearer ${this.authState.token}`;
    }

    const res = await fetch(`${SUPABASE_CONFIG.storageBaseUrl}/object/${bucket}/${path}`, {
      method: 'POST',
      headers,
      body: file
    });

    if (!res.ok) {
      throw new Error(`Failed to upload file to storage bucket "${bucket}" (HTTP ${res.status})`);
    }

    return `${SUPABASE_CONFIG.storageBaseUrl}/object/public/${bucket}/${path}`;
  }
}

export const adminService = new AdminServiceImpl();
