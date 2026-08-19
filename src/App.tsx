import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppStore } from './lib/store';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeHero } from './components/public/HomeHero';
import { CommitteesSection } from './components/public/CommitteesSection';
import { RecruitmentModal } from './components/public/RecruitmentModal';
import { EventsView } from './components/public/EventsView';
import { GalleryView } from './components/public/GalleryView';
import { ProjectsView } from './components/public/ProjectsView';
import { CulturalHubView } from './components/public/CulturalHubView';
import { InternshipsView } from './components/public/InternshipsView';
import { HallOfFameView } from './components/public/HallOfFameView';
import { MemberDirectory } from './components/members/MemberDirectory';
import { MemoriesWall } from './components/portal/MemoriesWall';
import { CVBuilder } from './components/portal/CVBuilder';
import { MemberProfile } from './components/portal/MemberProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CommitteeKey, SiteSettings, EventItem, GalleryItem, MemberProject, Internship, CulturalResource, MemoryPost } from './types';

const MainApp: React.FC = () => {
  const { currentProfile, isTeamMember } = useAuth();
  const { isRtl } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [preselectedCommittee, setPreselectedCommittee] = useState<CommitteeKey | undefined>(undefined);

  // App Store States
  const [settings, setSettings] = useState<SiteSettings>(() => AppStore.getSettings());
  const [events, setEvents] = useState<EventItem[]>(() => AppStore.getEvents());
  const [gallery, setGallery] = useState<GalleryItem[]>(() => AppStore.getGallery());
  const [projects, setProjects] = useState<MemberProject[]>(() => AppStore.getProjects());
  const [internships, setInternships] = useState<Internship[]>(() => AppStore.getInternships());
  const [cultural, setCultural] = useState<CulturalResource[]>(() => AppStore.getCulturalResources());
  const [memories, setMemories] = useState<MemoryPost[]>(() => AppStore.getMemories());

  // Subscribe to storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      setSettings(AppStore.getSettings());
      setEvents(AppStore.getEvents());
      setGallery(AppStore.getGallery());
      setProjects(AppStore.getProjects());
      setInternships(AppStore.getInternships());
      setCultural(AppStore.getCulturalResources());
      setMemories(AppStore.getMemories());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleOpenRecruitment = (comm?: CommitteeKey) => {
    setPreselectedCommittee(comm);
    setRecruitmentOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-[#39ff14]/30 selection:text-white font-['Inter','Cairo',sans-serif] ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Dynamic Cosmic Background */}
      <div className="fixed inset-0 cosmic-bg pointer-events-none -z-20" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Responsive Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={(mode) => handleOpenAuth(mode)}
        openRecruitmentModal={() => handleOpenRecruitment()}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <HomeHero
            settings={settings}
            onOpenRecruitment={() => handleOpenRecruitment()}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'committees' && (
          <CommitteesSection
            onOpenRecruitment={(comm) => handleOpenRecruitment(comm)}
          />
        )}

        {activeTab === 'events' && (
          <EventsView events={events} />
        )}

        {activeTab === 'hall_of_fame' && (
          <HallOfFameView />
        )}

        {activeTab === 'members' && (
          <MemberDirectory onOpenAuth={() => handleOpenAuth('login')} />
        )}

        {activeTab === 'gallery' && (
          <GalleryView gallery={gallery} />
        )}

        {activeTab === 'projects' && (
          <ProjectsView projects={projects} />
        )}

        {activeTab === 'cultural' && (
          <CulturalHubView
            resources={cultural}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {activeTab === 'internships' && (
          <InternshipsView
            internships={internships}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {activeTab === 'memories' && (
          <MemoriesWall
            memories={memories}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {(activeTab === 'cv' || activeTab === 'cv_builder') && (
          <CVBuilder />
        )}

        {activeTab === 'profile' && (
          <MemberProfile />
        )}

        {activeTab === 'admin' && (
          <ErrorBoundary fallbackTitle="لوحة القيادة الإدارية">
            <AdminDashboard />
          </ErrorBoundary>
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenRecruitment={() => handleOpenRecruitment()}
      />

      {/* Global Modals */}
      <RecruitmentModal
        isOpen={recruitmentOpen}
        onClose={() => setRecruitmentOpen(false)}
        preselectedCommittee={preselectedCommittee}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      {/* PWA 1-Tap Mobile Install */}
      <PWAInstallBanner />

    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
