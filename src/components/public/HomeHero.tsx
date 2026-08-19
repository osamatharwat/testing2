import React from 'react';
import { 
  Sparkles, 
  Users, 
  Briefcase, 
  Award, 
  CalendarCheck, 
  HeartHandshake, 
  Send,
  MessageCircle,
  TrendingUp,
  GraduationCap,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  Lightbulb,
  BookOpen,
  Building,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { formatWhatsAppUrl } from '../../lib/whatsapp';
import { useLanguage } from '../../context/LanguageContext';

interface HomeHeroProps {
  settings: SiteSettings;
  onOpenRecruitment: () => void;
  onNavigate: (tab: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  settings,
  onOpenRecruitment,
  onNavigate
}) => {
  const { t, isRtl, language } = useLanguage();

  const stats = [
    { num: '+4', label: t('stat_jobfairs'), sub: t('stat_jobfairs_sub'), icon: Briefcase },
    { num: '+1,500', label: t('stat_beneficiaries'), sub: t('stat_beneficiaries_sub'), icon: Users },
    { num: '+180', label: t('stat_members'), sub: t('stat_members_sub'), icon: Award },
    { num: '2019', label: t('stat_founded'), sub: t('stat_founded_sub'), icon: CalendarCheck },
  ];

  const quickLinks = [
    { id: 'events', title: t('portal_events_title'), desc: t('portal_events_desc'), icon: Calendar },
    { id: 'committees', title: t('portal_committees_title'), desc: t('portal_committees_desc'), icon: Users },
    { id: 'gallery', title: t('portal_gallery_title'), desc: t('portal_gallery_desc'), icon: ImageIcon },
    { id: 'projects', title: t('portal_projects_title'), desc: t('portal_projects_desc'), icon: Lightbulb },
    { id: 'cultural', title: t('portal_cultural_title'), desc: t('portal_cultural_desc'), icon: BookOpen },
    { id: 'internships', title: t('portal_internships_title'), desc: t('portal_internships_desc'), icon: Building },
  ];

  const prHeadWhatsApp = formatWhatsAppUrl(
    settings.pr_head_phone, 
    language === 'ar' 
      ? 'مرحباً، أود التواصل مع مسؤول العلاقات العامة لنشاط Aliens Student Activity بخصوص الرعاية أو الشراكات.'
      : 'Hello, I would like to reach out to the PR Head of Aliens Student Activity regarding partnerships and sponsorships.'
  );
  
  const prSubWhatsApp = formatWhatsAppUrl(
    settings.pr_sub_phone, 
    language === 'ar'
      ? 'مرحباً، أود التواصل مع نائب العلاقات العامة لنشاط Aliens Student Activity.'
      : 'Hello, I would like to reach out to the PR Vice Head of Aliens Student Activity.'
  );

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background glow discs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#39ff14]/15 via-[#38bdf8]/10 to-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center px-4 space-y-8">
          
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel neon-border animate-in fade-in zoom-in-95">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39ff14] animate-ping" />
            <span className="text-xs font-black text-slate-200 tracking-wide">
              {settings.hero_tagline || t('hero_tag')}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] font-['Outfit']">
            {settings.hero_headline ? (
              <span className="bg-gradient-to-r from-[#39ff14] via-emerald-300 to-[#38bdf8] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(57,255,20,0.4)]">
                {settings.hero_headline}
              </span>
            ) : (
              <>
                {t('hero_welcome')} <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#39ff14] via-emerald-300 to-[#38bdf8] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(57,255,20,0.4)]">
                  {t('hero_crew')}
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            {settings.hero_description || t('hero_desc')}
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onOpenRecruitment}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_30px_rgba(57,255,20,0.35)] hover:shadow-[0_0_45px_rgba(57,255,20,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span>{t('hero_cta_join')}</span>
            </button>
            <button
              onClick={() => onNavigate('members')}
              className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-white/10 text-white font-black text-sm sm:text-base hover:bg-white/15 border border-white/20 transition-all transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Users className="w-5 h-5 text-[#39ff14]" />
              <span>دليل وبحث طاقم الأعضاء 👥</span>
            </button>
            <button
              onClick={() => onNavigate('committees')}
              className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl glass-panel text-white font-black text-sm sm:text-base hover:bg-white/10 border border-white/15 transition-all transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
            >
              <span>{t('hero_cta_committees')}</span>
            </button>
          </div>

          {/* Announcement Banner */}
          {settings.announcement_banner && (
            <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-r from-[#39ff14]/10 via-cyan-500/10 to-purple-600/10 border border-[#39ff14]/25 text-xs text-slate-200 font-bold max-w-2xl mx-auto flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#39ff14]" />
              <span>{settings.announcement_banner}</span>
            </div>
          )}

        </div>
      </section>

      {/* Achievements & Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t('hero_achievements_title')}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {t('hero_achievements_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="glass-panel p-6 rounded-3xl text-center space-y-3 relative overflow-hidden group hover:border-[#39ff14]/40 transition-all hover:-translate-y-1.5 shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#39ff14]/10 border border-[#39ff14]/20 flex items-center justify-center text-[#39ff14] mx-auto group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  <span className="text-[#39ff14]">{st.num}</span>
                </div>
                <h3 className="font-extrabold text-white text-base">{st.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">{t('who_we_are_title')}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('who_we_are_desc')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#39ff14]/10 border border-[#39ff14]/30 flex items-center justify-center text-[#39ff14]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">{t('our_vision_title')}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('our_vision_desc')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">{t('our_mission_title')}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('our_mission_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t('quick_links_title')}
          </h2>
          <p className="text-slate-400 text-sm">
            {t('quick_links_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <div
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="glass-panel p-6 rounded-3xl cursor-pointer hover:border-[#39ff14]/50 transition-all hover:-translate-y-1 group flex items-start gap-4"
              >
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#39ff14] group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-black text-white text-base group-hover:text-[#39ff14] transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {link.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PR & Sponsorship Portals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-strong p-8 sm:p-12 rounded-3xl border border-white/15 relative overflow-hidden">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {t('join_portal_title')}
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
              {t('join_portal_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Box */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#39ff14]/10 to-emerald-950/40 border border-[#39ff14]/30 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#39ff14]/20 flex items-center justify-center text-[#39ff14]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white">{t('students_portal_title')}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t('students_portal_desc')}
                </p>
              </div>

              <button
                onClick={onOpenRecruitment}
                className="w-full py-4 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-sm hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t('apply_recruitment_btn')}</span>
              </button>
            </div>

            {/* Sponsors Box with WhatsApp Actions */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-950/40 border border-cyan-500/30 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white">{t('pr_portal_title')}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t('pr_portal_desc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* PR Head WhatsApp */}
                <a
                  href={prHeadWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-[#25D366] text-slate-950 font-black text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all group cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-slate-950" />
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <span className="block font-black">{t('chat_pr_head')}</span>
                    <span className="text-[10px] opacity-80 block font-mono">{settings.pr_head_phone}</span>
                  </div>
                </a>

                {/* PR Sub-Head WhatsApp */}
                <a
                  href={prSubWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-900/80 transition-all group cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <span className="block font-black">{t('chat_pr_sub')}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{settings.pr_sub_phone}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
