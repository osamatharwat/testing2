import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { isLeaderOrHead, isTeamLeadership, isIREvaluator } from '../../lib/permissions';
import { 
  Rocket, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Lightbulb, 
  BookOpen, 
  Briefcase, 
  FileText, 
  User, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  Sparkles,
  MessageSquareQuote,
  ChevronDown,
  Globe,
  Trophy,
  LayoutGrid,
  ChevronRight,
  Zap,
  Star
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
  openRecruitmentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openRecruitmentModal
}) => {
  const { currentProfile, isTeamMember, logout, switchProfile, allProfiles } = useAuth();
  const demoMode = Boolean((import.meta as any).env?.DEV || (import.meta as any).env?.VITE_DEMO_MODE === 'true');
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const [sectionsMenuOpen, setSectionsMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const menuModalRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const isActualMember = !!(
    currentProfile && 
    currentProfile.role !== 'guest' && 
    currentProfile.membership_status !== 'guest'
  );

  const canAccessAdmin = currentProfile && (
    isLeaderOrHead(currentProfile.role) || 
    isIREvaluator(currentProfile) || 
    isTeamLeadership(currentProfile.role)
  );

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuModalRef.current && !menuModalRef.current.contains(event.target as Node)) {
        setSectionsMenuOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSectionsMenuOpen(false);
        setRoleSwitcherOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setSectionsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'og': return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'team_head':
      case 'team_sub_head': return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'head':
      case 'sub_head': return 'bg-emerald-950/80 text-[#39ff14] border-[#39ff14]/40';
      case 'ir': return 'bg-blue-950/80 text-cyan-300 border-cyan-500/40';
      case 'member': return 'bg-slate-900 text-slate-300 border-slate-700';
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-700';
    }
  };

  // Grouped Navigation Sections for the Menu Bar Drawer
  const menuCategories = [
    {
      title: language === 'ar' ? 'الرئيسية والاستكشاف' : 'Exploration & Activity',
      items: [
        { id: 'home', labelKey: 'nav_home', icon: Rocket, desc: language === 'ar' ? 'الصفحة الرئيسية ومقدمة النشاط' : 'Home hub and activity introduction' },
        { id: 'committees', labelKey: 'nav_committees', icon: Users, desc: language === 'ar' ? 'لجان وفرق عمل Aliens' : 'Committees and operational wings' },
        { id: 'members', labelKey: 'nav_members', icon: Sparkles, desc: language === 'ar' ? 'دليل وبحث أعضاء طاقم Aliens وبطاقات الاستوري' : 'Crew directory & Story cards' },
        { id: 'hall_of_fame', labelKey: 'nav_hall_of_fame', icon: Trophy, desc: language === 'ar' ? 'لوحة الشرف وتكريمات التميز' : 'Hall of fame and top achievers' },
        { id: 'gallery', labelKey: 'nav_gallery', icon: ImageIcon, desc: language === 'ar' ? 'معرض الصور وأرشيف اللحظات' : 'Photo gallery and moments archive' },
      ]
    },
    {
      title: language === 'ar' ? 'الفعاليات والتطوير الصيدلي' : 'Events & Pharmacy Career',
      items: [
        { id: 'events', labelKey: 'nav_events', icon: Calendar, desc: language === 'ar' ? 'المؤتمرات، الملتقيات والبوسترات' : 'Conferences, workshops & posters' },
        { id: 'projects', labelKey: 'nav_projects', icon: Lightbulb, desc: language === 'ar' ? 'ابتكارات ومشاريع الأعضاء' : 'Member pharmaceutical projects' },
        { id: 'cultural', labelKey: 'nav_cultural', icon: BookOpen, desc: language === 'ar' ? 'المكتبة الثقافية والملفات العلمية' : 'Scientific & cultural resources' },
        { id: 'internships', labelKey: 'nav_internships', icon: Briefcase, desc: language === 'ar' ? 'فرص التدريب الصيدلي والشركات' : 'Pharma internships & training' },
      ]
    },
    ...(isTeamMember ? [{
      title: language === 'ar' ? 'بوابة الفريق والأعضاء' : 'Private Team Space',
      items: [
        { id: 'memories', labelKey: 'nav_memories', icon: MessageSquareQuote, desc: language === 'ar' ? 'حائط الذكريات وتبادل الرسائل' : 'Memories wall & team notes' },
        { id: 'cv', labelKey: 'nav_cv', icon: FileText, desc: language === 'ar' ? 'صانع السيرة الذاتية الاحترافية' : 'Cosmic Pharma CV Builder' },
        { id: 'profile', labelKey: 'nav_profile', icon: User, desc: language === 'ar' ? 'الملف الشخصي، الرتبة ونقاط XP' : 'Member profile, tier & Cosmic XP' },
      ]
    }] : []),
    ...(canAccessAdmin ? [{
      title: language === 'ar' ? 'الإدارة والقيادة' : 'Admin & Governance',
      items: [
        { id: 'admin', labelKey: 'nav_admin', icon: ShieldCheck, desc: language === 'ar' ? 'لوحة القيادة، التقييم وإدارة النظام' : 'Aliens command center & evaluations' },
      ]
    }] : [])
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* 1️⃣ Brand Logo / Web Name */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => handleNavClick('home')}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#39ff14]/20 via-[#38bdf8]/15 to-purple-600/20 border border-[#39ff14]/30 flex items-center justify-center text-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.25)] group-hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-wider text-white font-['Outfit'] group-hover:text-[#39ff14] transition-colors">
                    ALIENS<span className="text-[#39ff14]">SPACE</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25 hidden sm:inline-block">
                    {t('delta_pharma')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  {t('app_sub')}
                </p>
              </div>
            </div>

            {/* 2️⃣ Center / Right Navigation Controls */}
            <div className="flex items-center gap-3">
              
              {/* 🧭 SECTIONS MENU BUTTON (منيو الأقسام لسهولة الانتقال) */}
              <button
                onClick={() => setSectionsMenuOpen(!sectionsMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md ${
                  sectionsMenuOpen
                    ? 'bg-[#39ff14] text-slate-950 shadow-[#39ff14]/30'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#39ff14]/40'
                }`}
                title={language === 'ar' ? 'عرض جميع أقسام الموقع' : 'Explore all sections'}
              >
                {sectionsMenuOpen ? (
                  <X className="w-4 h-4 text-slate-950" />
                ) : (
                  <LayoutGrid className="w-4 h-4 text-[#39ff14]" />
                )}
                <span>{language === 'ar' ? 'أقسام الموقع' : 'Sections Menu'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${sectionsMenuOpen ? 'rotate-180 text-slate-950' : 'text-slate-400'}`} />
              </button>

              {/* 🌐 LANGUAGE SWITCHER TOGGLE (أيقونة تغيير اللغة) */}
              <button
                onClick={toggleLanguage}
                className="p-2.5 sm:px-3 sm:py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-slate-200 flex items-center gap-1.5 transition-all hover:border-[#39ff14]/40 cursor-pointer shadow-sm"
                title={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
              >
                <Globe className="w-4 h-4 text-[#39ff14]" />
                <span className="font-mono text-xs hidden sm:inline-block">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              {/* 🚀 RECRUITMENT CTA - HIDDEN IF USER IS AN ACTUAL MEMBER */}
              {!isActualMember && (
                <button
                  onClick={openRecruitmentModal}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{t('nav_join_crew')}</span>
                </button>
              )}

              {/* 👤 USER PROFILE & ROLE SWITCHER (البروفايل الشخصي) */}
              {currentProfile ? (
                <div className="relative" ref={roleDropdownRef}>
                  <div
                    onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 sm:pr-3 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-[#39ff14]/40 transition-all cursor-pointer shadow-inner"
                  >
                    <img
                      src={currentProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.full_name)}&background=07101d&color=39ff14`}
                      alt={currentProfile.full_name}
                      className="w-8 h-8 rounded-xl object-cover border border-[#39ff14]/30"
                    />
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                        <span>{currentProfile.full_name.split(' ')[0]}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${getRoleBadgeColor(currentProfile.role)}`}>
                          {currentProfile.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {currentProfile.committee ? currentProfile.committee.toUpperCase() : 'General'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </div>

                  {/* Profile & Switcher Dropdown */}
                  {roleSwitcherOpen && (
                    <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-80 rounded-3xl glass-panel-strong shadow-2xl p-4 z-50 border border-white/15 animate-in fade-in zoom-in-95`}>
                      <div className="px-2 py-1.5 mb-3 border-b border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-white">{currentProfile.full_name}</p>
                          <p className="text-[10px] text-[#39ff14] font-bold">{currentProfile.position}</p>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(currentProfile.role)}`}>
                          {currentProfile.role}
                        </span>
                      </div>

                      {/* Quick Profile Links */}
                      <div className="space-y-1 pb-3 border-b border-white/10">
                        <button
                          onClick={() => {
                            handleNavClick('profile');
                            setRoleSwitcherOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-right cursor-pointer"
                        >
                          <User className="w-4 h-4 text-[#39ff14]" />
                          <span>{language === 'ar' ? 'عرض بروفايلي ورتبة الـ XP' : 'My Profile & XP Tier'}</span>
                        </button>

                        {canAccessAdmin && (
                          <button
                            onClick={() => {
                              handleNavClick('admin');
                              setRoleSwitcherOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/15 transition-colors text-right cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span>{language === 'ar' ? 'لوحة القيادة الإدارية' : 'Admin Command Center'}</span>
                          </button>
                        )}
                      </div>

                      {/* Role Switcher is development/demo-only. Never expose it in production. */}
                      {demoMode && (
                      <div className="pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                          {t('role_switcher')}
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                          {allProfiles.map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                switchProfile(p.id);
                                setRoleSwitcherOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition-all cursor-pointer ${
                                currentProfile.id === p.id
                                  ? 'bg-[#39ff14]/15 border border-[#39ff14]/40 text-white font-bold'
                                  : 'hover:bg-white/5 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <img
                                  src={p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=07101d&color=39ff14`}
                                  alt={p.full_name}
                                  className="w-6 h-6 rounded-lg object-cover shrink-0"
                                />
                                <div className="truncate text-right">
                                  <p className="font-bold text-white text-[11px] leading-tight truncate">{p.full_name}</p>
                                  <p className="text-[9px] text-slate-400 truncate">{p.position}</p>
                                </div>
                              </div>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border shrink-0 ${getRoleBadgeColor(p.role)}`}>
                                {p.role}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-end">
                        <button
                          onClick={() => {
                            logout();
                            setRoleSwitcherOpen(false);
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 px-2 py-1 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t('nav_logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('nav_login')}</span>
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black text-slate-950 bg-[#39ff14] hover:bg-[#39ff14]/90 transition-all cursor-pointer shadow-md shadow-[#39ff14]/20"
                  >
                    <span>{t('nav_signup')}</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* 🧭 FULL SECTIONS MENU DRAWER (منيو الأقسام الشاملة) */}
      {sectionsMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div 
            ref={menuModalRef}
            className="max-w-4xl mx-auto mt-24 mb-10 mx-4 sm:mx-auto glass-panel-strong rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-6"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#39ff14]/15 border border-[#39ff14]/30 flex items-center justify-center text-[#39ff14]">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {language === 'ar' ? 'دليل وأقسام المنصة' : 'Platform Sections Hub'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'انتقل إلى أي قسم بنقرة واحدة' : 'Navigate smoothly across all Aliens Space wings'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSectionsMenuOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorized Sections Grid */}
            <div className="space-y-6">
              {menuCategories.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <div className="text-xs font-black uppercase text-[#39ff14] tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#39ff14]" />
                    <span>{group.title}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                            isActive
                              ? 'bg-[#39ff14]/15 border-[#39ff14] shadow-lg shadow-[#39ff14]/15'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-[#39ff14]/40'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                              isActive
                                ? 'bg-[#39ff14] text-slate-950 font-black'
                                : 'bg-slate-900 border border-white/10 text-[#39ff14]'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>

                            <div className="space-y-0.5">
                              <h4 className={`text-sm font-black transition-colors ${
                                isActive ? 'text-[#39ff14]' : 'text-white group-hover:text-[#39ff14]'
                              }`}>
                                {t(item.labelKey)}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-[#39ff14] transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer CTA */}
            {!isActualMember && (
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'هل تود الانضمام إلى طاقم Aliens بكلية الصيدلة؟' : 'Interested in joining Aliens Pharmacy Crew?'}
                </p>
                <button
                  onClick={() => {
                    setSectionsMenuOpen(false);
                    openRecruitmentModal();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black bg-[#39ff14] text-slate-950 hover:brightness-110 shadow-lg shadow-[#39ff14]/25 transition-all cursor-pointer"
                >
                  {t('nav_join_crew')} 🚀
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
