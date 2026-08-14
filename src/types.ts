export interface ListenEvent {
  recitationId: string;
  reciterId?: string;
  durationSeconds?: number;
  timestamp?: number;
  completed?: boolean;
}

export interface LikeResult {
  isLiked: boolean;
  likeCount: number;
}

export interface Reciter {
  id: string;
  displayName: string;
  pseudonym?: string;
  isAnonymous?: boolean;
  gender: 'male' | 'female';
  country: string;
  countryCode: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  isStaffPick?: boolean;
  stats: {
    totalRecitations: number;
    totalListens: number;
    totalLikes: number;
  };
  createdAt: string;
}

export interface Recitation {
  id: string;
  reciterId: string;
  reciterName: string;
  reciterAvatar: string;
  reciterCountry: string;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahRange?: string; // e.g. "1 - 7" or "كاملة"
  riwayah: string; // e.g. "حفص عن عاصم", "ورش عن نافع"
  duration: number; // in seconds
  durationFormatted: string; // e.g. "03:45"
  audioUrl: string;
  coverUrl?: string;
  listenCount: number;
  likeCount: number;
  isLiked?: boolean;
  isStaffPick?: boolean;
  isFeatured?: boolean;
  description?: string;
  createdAt: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface RecitationSubmission {
  id: string;
  displayName: string;
  pseudonym?: string;
  usePseudonym: boolean;
  gender: 'male' | 'female';
  country: string;
  avatarUrl?: string;
  surahNumber: number;
  surahName: string;
  ayahRange: string;
  riwayah: string;
  description: string;
  audioFileName: string;
  audioDuration: number;
  audioUrl?: string;
  externalAudioUrl?: string;
  externalImageUrl?: string;
  agreeToTerms: boolean;
  submittedAt: string;
  status: SubmissionStatus;
  adminNotes?: string;
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  ayahsCount: number;
  revelationType: 'مكية' | 'مدنية';
}

export type NavigationTab = 'home' | 'listen' | 'submit' | 'featured' | 'about';

export type AdminTab = 
  | 'dashboard'
  | 'submissions'
  | 'reciters'
  | 'recitations'
  | 'announcements'
  | 'competitions'
  | 'rewards'
  | 'notifications'
  | 'statistics';

export type AdminRole = 'SUPER_ADMIN' | 'CONTENT_REVIEWER' | 'AUDITOR';

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  token: string | null;
  admin: AdminProfile | null;
}

export interface AdminDashboardStats {
  totalReciters: number;
  publishedReciters: number;
  totalRecitations: number;
  publishedRecitations: number;
  pendingSubmissions: number;
  totalListens: number;
  totalLikes: number;
  activeCompetitions: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  imagePath?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  imagePath?: string;
  startAt: string;
  endAt: string;
  isPublished: boolean;
  createdAt: string;
}

export type HonorCategory = 'TAJWEED_EXCELLENCE' | 'COMMUNITY_FAVORITE' | 'MILESTONE_COMPLETION' | 'EDITORIAL_HONOR';

export interface RewardDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  category: HonorCategory;
  badgeIconPath?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReciterHonor {
  id: string;
  reciterId: string;
  rewardId: string;
  awardedAt: string;
  awardedBy?: string;
  citationNote?: string;
  reward?: RewardDefinition;
}

export interface AdminNotification {
  id: string;
  notificationType: string;
  title: string;
  content: string;
  referenceId?: string;
  isRead: boolean;
  sentViaEmail?: boolean;
  createdAt: string;
}

export type DiscoveryFilter = 'all' | 'popular' | 'most_liked' | 'latest' | 'staff_picks' | 'new_reciters';

export interface PlayerState {
  currentRecitation: Recitation | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  queue: Recitation[];
  queueIndex: number;
}
