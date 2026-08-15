import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Reciter,
  Recitation,
  RecitationSubmission,
  PlayerState
} from './types';
import {
  reciterRepository,
  recitationRepository,
  submissionRepository
} from './services/Repositories';
import { audioService } from './services/AudioService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { HomeActions } from './components/HomeActions';
import { RecitationCard } from './components/RecitationCard';
import { ReciterCard } from './components/ReciterCard';
import { ReciterProfileModal } from './components/ReciterProfileModal';
import { PlayerBar } from './components/PlayerBar';
import { FullPlayerModal } from './components/FullPlayerModal';
import { SubmitRecitationView } from './components/SubmitRecitationView';
import { SubmissionsListModal } from './components/SubmissionsListModal';
import { FeaturedRecitersView } from './components/FeaturedRecitersView';
import { ListenScreen } from './components/ListenScreen';
import { AboutScreen } from './components/AboutScreen';
import { AndroidArchitectureModal } from './components/AndroidArchitectureModal';
import { AdminControlPanel } from './components/admin/AdminControlPanel';
import { Radio, Sparkles, BookOpen, UserCheck, Flame, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [submissions, setSubmissions] = useState<RecitationSubmission[]>([]);
  
  // Modals & Navigation state
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState<boolean>(
    typeof window !== 'undefined' && window.location.hash === '#admin'
  );

  // Global Player State
  const [playerState, setPlayerState] = useState<PlayerState>(audioService.getState());

  // Load initial data from Clean Architecture Repositories
  const loadData = async () => {
    try {
      const [allReciters, allRecitations, allSubmissions] = await Promise.all([
        reciterRepository.getAllReciters(),
        recitationRepository.getAllRecitations(),
        submissionRepository.getUserSubmissions()
      ]);
      setReciters(allReciters);
      setRecitations(allRecitations);
      setSubmissions(allSubmissions);
    } catch (e) {
      console.error('Failed to load repositories data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync hash routing for admin panel
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminViewOpen(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Subscribe to Audio Engine events
  useEffect(() => {
    const unsubscribe = audioService.subscribe((newState) => {
      setPlayerState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Audio Play Trigger with domain ListenEvent
  const handlePlayRecitation = (recitation: Recitation) => {
    audioService.playRecitation(recitation, recitations);
    recitationRepository.recordListenEvent({
      recitationId: recitation.id,
      reciterId: recitation.reciterId,
      timestamp: Date.now()
    });
  };

  // Like Toggle with user-specific repository delegation
  const handleLikeToggle = async (recitationId: string) => {
    const { isLiked, likeCount } = await recitationRepository.toggleLike(recitationId, 'user_current');
    setRecitations((prev) =>
      prev.map((r) =>
        r.id === recitationId ? { ...r, isLiked, likeCount } : r
      )
    );
  };

  // Submission handler
  const handleSubmitRecitation = async (
    data: Omit<RecitationSubmission, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newSub = await submissionRepository.submitRecitation(data);
    setSubmissions((prev) => [newSub, ...prev]);
    return newSub;
  };

  // Reciter click handler
  const handleSelectReciter = (reciter: Reciter) => {
    setSelectedReciter(reciter);
  };

  const handleSelectReciterById = (reciterId: string) => {
    const found = reciters.find((r) => r.id === reciterId);
    if (found) {
      setSelectedReciter(found);
    }
  };

  // Staff picks for Home highlights
  const homeStaffRecitations = recitations.filter((r) => r.isStaffPick).slice(0, 4);
  const homeTopReciters = reciters.slice(0, 4);

  // If Admin Panel is open, render the Owner Admin Workspace
  if (isAdminViewOpen) {
    return (
      <AdminControlPanel
        onBackToApp={() => {
          setIsAdminViewOpen(false);
          if (window.location.hash === '#admin') {
            window.history.pushState(null, '', window.location.pathname);
          }
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#102A20] flex flex-col font-tajawal pb-28 select-none">
      {/* Top Application Bar */}
      <Header
        onOpenSubmissions={() => setIsSubmissionsModalOpen(true)}
        submissions={submissions}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenAdmin={() => {
          setIsAdminViewOpen(true);
          window.location.hash = 'admin';
        }}
        isTabletView={isTabletView}
        onToggleTabletView={() => setIsTabletView(!isTabletView)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5">
        {/* Tab 1: الرئيسية (Home) */}
        {currentTab === 'home' && (
          <div className="space-y-8">
            {/* Hero Banner with Replaceable Artwork Concept */}
            <HeroSection
              onExploreClick={() => setCurrentTab('listen')}
              onSubmitClick={() => setCurrentTab('submit')}
            />

            {/* 3 Main Action Cards */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#102A20] font-amiri flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A961]" />
                  <span>الخدمات والأقسام الرئيسية</span>
                </h3>
              </div>
              <HomeActions onNavigate={(tab) => setCurrentTab(tab)} />
            </section>

            {/* Featured Recitations Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#102A20] font-amiri flex items-center gap-2">
                    <Radio className="w-5 h-5 text-[#315F4A]" />
                    <span>تلاوات مختارة ومعتمدة</span>
                  </h3>
                  <p className="text-xs text-[#7A847E]">
                    تلاوات بأصوات خاشعة خضعت لمراجعة وتدقيق الإدارة
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('listen')}
                  className="text-xs font-semibold text-[#315F4A] hover:text-[#102A20] flex items-center gap-1"
                >
                  <span>عرض الكل ({recitations.length})</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeStaffRecitations.map((recitation) => (
                  <RecitationCard
                    key={recitation.id}
                    recitation={recitation}
                    playerState={playerState}
                    onPlay={handlePlayRecitation}
                    onLikeToggle={handleLikeToggle}
                    onReciterClick={handleSelectReciterById}
                  />
                ))}
              </div>
            </section>

            {/* Discover Reciters Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#102A20] font-amiri flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#315F4A]" />
                    <span>أصوات القراء من حول العالم</span>
                  </h3>
                  <p className="text-xs text-[#7A847E]">
                    تعرف على القراء وتصفح ملفاتهم الشخصية وتلاواتهم المنشورة
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('featured')}
                  className="text-xs font-semibold text-[#315F4A] hover:text-[#102A20] flex items-center gap-1"
                >
                  <span>قائمة القراء</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {homeTopReciters.map((reciter) => (
                  <ReciterCard
                    key={reciter.id}
                    reciter={reciter}
                    onClick={handleSelectReciter}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: استمع إلى القراء (Listen / Discovery) */}
        {currentTab === 'listen' && (
          <ListenScreen
            recitations={recitations}
            reciters={reciters}
            playerState={playerState}
            onPlay={handlePlayRecitation}
            onLikeToggle={handleLikeToggle}
            onSelectReciter={handleSelectReciter}
          />
        )}

        {/* Tab 3: انشر تلاوتك (Submit Your Recitation) */}
        {currentTab === 'submit' && (
          <SubmitRecitationView
            onSubmit={handleSubmitRecitation}
            onViewSubmissions={() => setIsSubmissionsModalOpen(true)}
            submissionsCount={submissions.length}
          />
        )}

        {/* Tab 4: أبرز القراء (Featured Reciters & Rankings) */}
        {currentTab === 'featured' && (
          <FeaturedRecitersView
            reciters={reciters}
            recitations={recitations}
            playerState={playerState}
            onSelectReciter={handleSelectReciter}
            onPlay={handlePlayRecitation}
            onLikeToggle={handleLikeToggle}
          />
        )}

        {/* Tab 5: عن التطبيق (About) */}
        {currentTab === 'about' && <AboutScreen />}
      </main>

      {/* Floating Bottom Audio Player Bar */}
      {playerState.currentRecitation && (
        <PlayerBar
          playerState={playerState}
          onTogglePlay={() => audioService.togglePlayPause()}
          onNext={() => audioService.playNext()}
          onPrevious={() => audioService.playPrevious()}
          onSeek={(sec) => audioService.seek(sec)}
          onLikeToggle={handleLikeToggle}
          onExpand={() => setIsPlayerExpanded(true)}
        />
      )}

      {/* Full-Screen Audio Player Modal */}
      {isPlayerExpanded && playerState.currentRecitation && (
        <FullPlayerModal
          playerState={playerState}
          onClose={() => setIsPlayerExpanded(false)}
          onTogglePlay={() => audioService.togglePlayPause()}
          onNext={() => audioService.playNext()}
          onPrevious={() => audioService.playPrevious()}
          onSeek={(sec) => audioService.seek(sec)}
          onLikeToggle={handleLikeToggle}
          onReciterClick={handleSelectReciterById}
        />
      )}

      {/* Reciter Profile Modal */}
      {selectedReciter && (
        <ReciterProfileModal
          reciter={selectedReciter}
          recitations={recitations}
          playerState={playerState}
          onClose={() => setSelectedReciter(null)}
          onPlay={handlePlayRecitation}
          onLikeToggle={handleLikeToggle}
        />
      )}

      {/* Submissions Status List Modal */}
      {isSubmissionsModalOpen && (
        <SubmissionsListModal
          submissions={submissions}
          onClose={() => setIsSubmissionsModalOpen(false)}
          onNewSubmission={() => {
            setIsSubmissionsModalOpen(false);
            setCurrentTab('submit');
          }}
        />
      )}

      {/* Kotlin / Jetpack Compose Clean Architecture Viewer */}
      {isArchitectureModalOpen && (
        <AndroidArchitectureModal
          onClose={() => setIsArchitectureModalOpen(false)}
        />
      )}

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
