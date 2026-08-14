import {
  Reciter,
  Recitation,
  RecitationSubmission,
  ListenEvent,
  LikeResult
} from '../types';
import { MOCK_RECITERS, MOCK_RECITATIONS, INITIAL_SUBMISSIONS } from '../data/mockData';

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
// IN-MEMORY / CLIENT-SIDE REPOSITORY IMPLEMENTATIONS (Prototype / Mock Data)
// ============================================================================

class InMemoryReciterRepository implements IReciterRepository {
  private reciters: Reciter[] = [...MOCK_RECITERS];
  private listeners: Set<(reciters: Reciter[]) => void> = new Set();

  getRecitersStream(onUpdate?: (reciters: Reciter[]) => void): () => void {
    if (onUpdate) {
      this.listeners.add(onUpdate);
      onUpdate([...this.reciters]);
    }
    return () => {
      if (onUpdate) this.listeners.delete(onUpdate);
    };
  }

  async getAllReciters(): Promise<Reciter[]> {
    return [...this.reciters];
  }

  async getReciterById(id: string): Promise<Reciter | null> {
    return this.reciters.find((r) => r.id === id) || null;
  }

  async getFeaturedReciters(): Promise<Reciter[]> {
    return this.reciters.filter((r) => r.isStaffPick || r.verified);
  }

  async searchReciters(query: string): Promise<Reciter[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [...this.reciters];
    return this.reciters.filter(
      (r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        (r.pseudonym && r.pseudonym.toLowerCase().includes(q))
    );
  }

  async getNewestReciters(limit: number = 10): Promise<Reciter[]> {
    return [...this.reciters]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

class InMemoryRecitationRepository implements IRecitationRepository {
  private recitations: Recitation[] = [...MOCK_RECITATIONS];
  // User-specific like tracking: tracks (userId + recitationId) to prevent unlimited likes
  private userLikesMap: Map<string, Set<string>> = new Map();
  // Listen events recorded for backend ingestion
  private recordedEvents: ListenEvent[] = [];
  private listeners: Set<(recitations: Recitation[]) => void> = new Set();

  constructor() {
    // Seed default user likes for demo session
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
      onUpdate([...this.recitations]);
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
    return [...this.recitations];
  }

  async getRecitationsByReciter(reciterId: string): Promise<Recitation[]> {
    return this.recitations.filter((r) => r.reciterId === reciterId);
  }

  /**
   * Conceptually user-specific: prevents unlimited like spam by toggling state per userId.
   */
  async toggleLike(recitationId: string, userId: string = 'user_current'): Promise<LikeResult> {
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
      // User unlikes
      userLikes.delete(recitationId);
      recitation.likeCount = Math.max(0, recitation.likeCount - 1);
      recitation.isLiked = false;
    } else {
      // User likes
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

  /**
   * Listen events are logged as domain events for future backend pipeline ingestion.
   */
  async recordListenEvent(event: ListenEvent): Promise<void> {
    const validEvent: ListenEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };
    this.recordedEvents.push(validEvent);

    // Increment local in-memory count for prototype preview
    const recitation = this.recitations.find((r) => r.id === event.recitationId);
    if (recitation) {
      recitation.listenCount += 1;
      this.notifyListeners();
    }
  }
}

class InMemoryStatisticsRepository implements IStatisticsRepository {
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

class InMemorySubmissionRepository implements ISubmissionRepository {
  private submissions: RecitationSubmission[] = [...INITIAL_SUBMISSIONS];
  private listeners: Set<(subs: RecitationSubmission[]) => void> = new Set();

  async getUserSubmissions(): Promise<RecitationSubmission[]> {
    return [...this.submissions];
  }

  async submitRecitation(
    data: Omit<RecitationSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<RecitationSubmission> {
    const newSubmission: RecitationSubmission = {
      ...data,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      adminNotes: 'تم استلام طلبكم وهو قيد المراجعة والتدقيق الصوتي والتجويدي من قبل الإدارة.'
    };

    this.submissions.unshift(newSubmission);
    this.listeners.forEach((listener) => listener([...this.submissions]));
    return newSubmission;
  }
}

// ============================================================================
// SINGLETON REPOSITORY INSTANCES (Dependency Injection)
// ============================================================================

export const reciterRepository: IReciterRepository = new InMemoryReciterRepository();
export const recitationRepository: IRecitationRepository = new InMemoryRecitationRepository();
export const statisticsRepository: IStatisticsRepository = new InMemoryStatisticsRepository(
  recitationRepository,
  reciterRepository
);
export const submissionRepository: ISubmissionRepository = new InMemorySubmissionRepository();
