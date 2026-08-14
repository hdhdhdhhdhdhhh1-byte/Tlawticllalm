import {
  Reciter,
  Recitation,
  RecitationSubmission,
  ListenEvent,
  LikeResult
} from '../types';
import { MOCK_RECITERS, MOCK_RECITATIONS, INITIAL_SUBMISSIONS } from '../data/mockData';
import { SupabaseService } from './SupabaseService';

export enum DataSourceMode {
  MOCK = 'MOCK',
  SUPABASE = 'SUPABASE'
}

let currentDataSourceMode: DataSourceMode = DataSourceMode.SUPABASE;

export function getDataSourceMode(): DataSourceMode {
  return currentDataSourceMode;
}

export function setDataSourceMode(mode: DataSourceMode) {
  currentDataSourceMode = mode;
}

// ============================================================================
// DOMAIN REPOSITORY INTERFACES (Clean Architecture - Backend Agnostic)
// ============================================================================

/**
 * Repository interface for managing and querying Reciters.
 * Compatible with Kotlin Flow streams and suspend functions.
 */
export interface IReciterRepository {
  getRecitersStream(onUpdate?: (reciters: Reciter[]) => void): () => void;
  getAllReciters(): Promise<Reciter[]>;
  getReciterById(id: string): Promise<Reciter | null>;
  getFeaturedReciters(): Promise<Reciter[]>;
  searchReciters(query: string): Promise<Reciter[]>;
  getNewestReciters(limit?: number): Promise<Reciter[]>;
}

/**
 * Repository interface for managing Recitations, user-specific like states,
 * and listen event ingestion.
 */
export interface IRecitationRepository {
  getRecitationsStream(onUpdate?: (recitations: Recitation[]) => void): () => void;
  getAllRecitations(): Promise<Recitation[]>;
  getRecitationsByReciter(reciterId: string): Promise<Recitation[]>;
  toggleLike(recitationId: string, userId?: string): Promise<LikeResult>;
  recordListenEvent(event: ListenEvent): Promise<void>;
}

/**
 * Repository interface for fetching ranking, discovery, and statistical metrics.
 * Decouples sorting and ranking logic from the UI presentation layer.
 */
export interface IStatisticsRepository {
  getMostListenedRecitations(limit?: number): Promise<Recitation[]>;
  getMostLikedRecitations(limit?: number): Promise<Recitation[]>;
  getMostListenedReciters(limit?: number): Promise<Reciter[]>;
  getMostLikedReciters(limit?: number): Promise<Reciter[]>;
  getNewestRecitations(limit?: number): Promise<Recitation[]>;
}

/**
 * Repository interface for handling recitation submission drafts and moderation status.
 */
export interface ISubmissionRepository {
  submitRecitation(
    submission: Omit<RecitationSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<RecitationSubmission>;
  getUserSubmissions(): Promise<RecitationSubmission[]>;
}

// ============================================================================
// HYBRID REPOSITORY IMPLEMENTATION (SUPABASE + MOCK FALLBACK)
// ============================================================================

class HybridReciterRepository implements IReciterRepository {
  private reciters: Reciter[] = [...MOCK_RECITERS];
  private listeners: Set<(reciters: Reciter[]) => void> = new Set();

  getRecitersStream(onUpdate?: (reciters: Reciter[]) => void): () => void {
    if (onUpdate) {
      this.listeners.add(onUpdate);
      this.getAllReciters().then((list) => onUpdate(list));
    }
    return () => {
      if (onUpdate) this.listeners.delete(onUpdate);
    };
  }

  async getAllReciters(): Promise<Reciter[]> {
    if (currentDataSourceMode === DataSourceMode.SUPABASE) {
      const data = await SupabaseService.fetchPublicReciters();
      if (data && Array.isArray(data) && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          displayName: d.display_name,
          pseudonym: d.pseudonym,
          isAnonymous: d.use_pseudonym,
          gender: (d.gender?.toLowerCase() === 'female' ? 'female' : 'male'),
          country: d.country,
          countryCode: d.country_code || 'SA',
          bio: d.bio || '',
          avatarUrl: d.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=face',
          verified: !!d.is_verified,
          isStaffPick: !!d.is_staff_pick,
          stats: {
            totalRecitations: d.total_recitations || 0,
            totalListens: d.total_listens || 0,
            totalLikes: d.total_likes || 0
          },
          createdAt: d.created_at || new Date().toISOString()
        }));
      }
    }
    return [...this.reciters];
  }

  async getReciterById(id: string): Promise<Reciter | null> {
    const list = await this.getAllReciters();
    return list.find((r) => r.id === id) || null;
  }

  async getFeaturedReciters(): Promise<Reciter[]> {
    const list = await this.getAllReciters();
    return list.filter((r) => r.isStaffPick || r.verified);
  }

  async searchReciters(query: string): Promise<Reciter[]> {
    const list = await this.getAllReciters();
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        (r.pseudonym && r.pseudonym.toLowerCase().includes(q))
    );
  }

  async getNewestReciters(limit: number = 10): Promise<Reciter[]> {
    const list = await this.getAllReciters();
    return [...list]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

class HybridRecitationRepository implements IRecitationRepository {
  private recitations: Recitation[] = [...MOCK_RECITATIONS];
  private userLikesMap: Map<string, Set<string>> = new Map();
  private recordedEvents: ListenEvent[] = [];
  private listeners: Set<(recitations: Recitation[]) => void> = new Set();

  constructor() {
    const defaultUserId = 'user_current';
    const seedLikes = new Set(['rec-2', 'rec-3', 'rec-8']);
    this.userLikesMap.set(defaultUserId, seedLikes);

    this.recitations = this.recitations.map((r) => ({
      ...r,
      isLiked: seedLikes.has(r.id)
    }));
  }

  getRecitationsStream(onUpdate?: (recitations: Recitation[]) => void): () => void {
    if (onUpdate) {
      this.listeners.add(onUpdate);
      this.getAllRecitations().then((list) => onUpdate(list));
    }
    return () => {
      if (onUpdate) this.listeners.delete(onUpdate);
    };
  }

  private notifyListeners() {
    const data = [...this.recitations];
    this.listeners.forEach((listener) => listener(data));
  }

  async getAllRecitations(): Promise<Recitation[]> {
    if (currentDataSourceMode === DataSourceMode.SUPABASE) {
      const data = await SupabaseService.fetchPublicRecitations();
      if (data && Array.isArray(data) && data.length > 0) {
        const userLikes = this.userLikesMap.get('user_current') || new Set();
        return data.map((d: any) => ({
          id: d.id,
          reciterId: d.reciter_id,
          reciterName: d.reciter_name,
          reciterAvatar: d.reciter_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=face',
          reciterCountry: d.reciter_country,
          surahNumber: d.surah_number,
          surahNameArabic: d.surah_name_arabic,
          surahNameEnglish: d.surah_name_english || '',
          ayahRange: d.ayah_range || 'كاملة',
          riwayah: d.riwayah || 'حفص عن عاصم',
          duration: d.duration_seconds || 180,
          durationFormatted: `${Math.floor((d.duration_seconds || 180) / 60).toString().padStart(2, '0')}:${((d.duration_seconds || 180) % 60).toString().padStart(2, '0')}`,
          audioUrl: d.audio_url || 'https://server8.mp3quran.net/afs/001.mp3',
          coverUrl: d.cover_image_path || undefined,
          listenCount: d.listen_count || 0,
          likeCount: d.like_count || 0,
          isLiked: userLikes.has(d.id),
          isStaffPick: !!d.is_staff_pick,
          description: d.description || '',
          createdAt: d.published_at || new Date().toISOString()
        }));
      }
    }
    return [...this.recitations];
  }

  /**
   * Reciter profile recitations must be ordered strictly by published_at DESC (newest published first).
   */
  async getRecitationsByReciter(reciterId: string): Promise<Recitation[]> {
    if (currentDataSourceMode === DataSourceMode.SUPABASE) {
      const data = await SupabaseService.fetchPublicRecitations(reciterId);
      if (data && Array.isArray(data) && data.length > 0) {
        const userLikes = this.userLikesMap.get('user_current') || new Set();
        return data.map((d: any) => ({
          id: d.id,
          reciterId: d.reciter_id,
          reciterName: d.reciter_name,
          reciterAvatar: d.reciter_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=face',
          reciterCountry: d.reciter_country,
          surahNumber: d.surah_number,
          surahNameArabic: d.surah_name_arabic,
          surahNameEnglish: d.surah_name_english || '',
          ayahRange: d.ayah_range || 'كاملة',
          riwayah: d.riwayah || 'حفص عن عاصم',
          duration: d.duration_seconds || 180,
          durationFormatted: `${Math.floor((d.duration_seconds || 180) / 60).toString().padStart(2, '0')}:${((d.duration_seconds || 180) % 60).toString().padStart(2, '0')}`,
          audioUrl: d.audio_url || 'https://server8.mp3quran.net/afs/001.mp3',
          coverUrl: d.cover_image_path || undefined,
          listenCount: d.listen_count || 0,
          likeCount: d.like_count || 0,
          isLiked: userLikes.has(d.id),
          isStaffPick: !!d.is_staff_pick,
          description: d.description || '',
          createdAt: d.published_at || new Date().toISOString()
        }));
      }
    }
    return this.recitations
      .filter((r) => r.reciterId === reciterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async toggleLike(recitationId: string, userId: string = 'user_current'): Promise<LikeResult> {
    if (currentDataSourceMode === DataSourceMode.SUPABASE) {
      const rpcResult = await SupabaseService.toggleLike(recitationId, userId);
      if (rpcResult) {
        const isLiked = !!rpcResult.v_new_state;
        const count = Number(rpcResult.v_count) || 0;
        let userLikes = this.userLikesMap.get(userId);
        if (!userLikes) {
          userLikes = new Set();
          this.userLikesMap.set(userId, userLikes);
        }
        if (isLiked) userLikes.add(recitationId); else userLikes.delete(recitationId);

        const recitation = this.recitations.find((r) => r.id === recitationId);
        if (recitation) {
          recitation.isLiked = isLiked;
          recitation.likeCount = count;
        }
        this.notifyListeners();
        return { isLiked, likeCount: count };
      }
    }

    let userLikes = this.userLikesMap.get(userId);
    if (!userLikes) {
      userLikes = new Set<string>();
      this.userLikesMap.set(userId, userLikes);
    }

    const index = this.recitations.findIndex((r) => r.id === recitationId);
    if (index === -1) {
      return { isLiked: false, likeCount: 0 };
    }

    const recitation = this.recitations[index];
    const isCurrentlyLiked = userLikes.has(recitationId);

    if (isCurrentlyLiked) {
      userLikes.delete(recitationId);
      recitation.likeCount = Math.max(0, recitation.likeCount - 1);
      recitation.isLiked = false;
    } else {
      userLikes.add(recitationId);
      recitation.likeCount += 1;
      recitation.isLiked = true;
    }

    this.notifyListeners();
    return {
      isLiked: recitation.isLiked,
      likeCount: recitation.likeCount
    };
  }

  async recordListenEvent(event: ListenEvent): Promise<void> {
    const validEvent: ListenEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };
    this.recordedEvents.push(validEvent);

    if (currentDataSourceMode === DataSourceMode.SUPABASE) {
      await SupabaseService.recordListenEvent(
        event.recitationId,
        'user_current',
        event.durationSeconds || 5,
        event.completed || false
      );
    }

    const recitation = this.recitations.find((r) => r.id === event.recitationId);
    if (recitation) {
      recitation.listenCount += 1;
      this.notifyListeners();
    }
  }
}

class HybridStatisticsRepository implements IStatisticsRepository {
  private recitationRepo: IRecitationRepository;
  private reciterRepo: IReciterRepository;

  constructor(recitationRepo: IRecitationRepository, reciterRepo: IReciterRepository) {
    this.recitationRepo = recitationRepo;
    this.reciterRepo = reciterRepo;
  }

  async getMostListenedRecitations(limit: number = 10): Promise<Recitation[]> {
    const all = await this.recitationRepo.getAllRecitations();
    return [...all].sort((a, b) => b.listenCount - a.listenCount).slice(0, limit);
  }

  async getMostLikedRecitations(limit: number = 10): Promise<Recitation[]> {
    const all = await this.recitationRepo.getAllRecitations();
    return [...all].sort((a, b) => b.likeCount - a.likeCount).slice(0, limit);
  }

  async getMostListenedReciters(limit: number = 10): Promise<Reciter[]> {
    const all = await this.reciterRepo.getAllReciters();
    return [...all].sort((a, b) => b.stats.totalListens - a.stats.totalListens).slice(0, limit);
  }

  async getMostLikedReciters(limit: number = 10): Promise<Reciter[]> {
    const all = await this.reciterRepo.getAllReciters();
    return [...all].sort((a, b) => b.stats.totalLikes - a.stats.totalLikes).slice(0, limit);
  }

  async getNewestRecitations(limit: number = 10): Promise<Recitation[]> {
    const all = await this.recitationRepo.getAllRecitations();
    return [...all]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

class HybridSubmissionRepository implements ISubmissionRepository {
  private submissions: RecitationSubmission[] = [...INITIAL_SUBMISSIONS];
  private listeners: Set<(subs: RecitationSubmission[]) => void> = new Set();

  async getUserSubmissions(): Promise<RecitationSubmission[]> {
    return [...this.submissions];
  }

  async submitRecitation(
    data: Omit<RecitationSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<RecitationSubmission> {
    const submissionId = `sub-${Date.now()}`;
    const newSubmission: RecitationSubmission = {
      ...data,
      id: submissionId,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      adminNotes: 'تم استلام طلبكم وهو قيد المراجعة والتدقيق الصوتي والتجويدي من قبل الإدارة.'
    };

    if (currentDataSourceMode === DataSourceMode.SUPABASE) {
      await SupabaseService.submitRecitation({
        display_name: data.displayName,
        pseudonym: data.pseudonym || null,
        use_pseudonym: data.usePseudonym,
        gender: data.gender.toUpperCase(),
        country: data.country,
        surah_number: data.surahNumber,
        surah_name: data.surahName,
        ayah_range: data.ayahRange,
        riwayah: data.riwayah,
        description: data.description,
        audio_storage_path: `submissions/${submissionId}.mp3`,
        audio_duration_seconds: data.audioDuration,
        status: 'PENDING'
      });
    }

    this.submissions.unshift(newSubmission);
    this.listeners.forEach((listener) => listener([...this.submissions]));
    return newSubmission;
  }
}

// ============================================================================
// SINGLETON REPOSITORY INSTANCES (Dependency Injection)
// ============================================================================

export const reciterRepository: IReciterRepository = new HybridReciterRepository();
export const recitationRepository: IRecitationRepository = new HybridRecitationRepository();
export const statisticsRepository: IStatisticsRepository = new HybridStatisticsRepository(
  recitationRepository,
  reciterRepository
);
export const submissionRepository: ISubmissionRepository = new HybridSubmissionRepository();

