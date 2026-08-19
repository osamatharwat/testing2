import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Heart, 
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Rocket
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavClick?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenRecruitment?: () => void;
  settings?: any;
  prHeadPhone?: string;
  prSubPhone?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavClick,
  onNavigate,
  onOpenRecruitment,
  settings,
  prHeadPhone = '01012345678',
  prSubPhone = '01198765432'
}) => {
  const { t, language, isRtl } = useLanguage();
  const handleNavigate = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    else if (onNavClick) onNavClick(tab);
  };

  return (
    <footer className="bg-[#02050c] border-t border-white/10 text-slate-400 text-sm mt-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#39ff14]/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#38bdf8]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39ff14]/20 to-cyan-500/20 border border-[#39ff14]/40 flex items-center justify-center text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                <Rocket className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-wider text-white font-['Outfit']">
                ALIENS<span className="text-[#39ff14]">SPACE</span>
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              {t('footer_desc')}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/Aliens.delta"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/aliens.du1"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10 transition-all"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/aliens-delta-063993243"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-black uppercase tracking-wider border-b border-white/10 pb-2">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNavigate('events')} className="hover:text-[#39ff14] transition-colors cursor-pointer">
                  {t('portal_events_title')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('committees')} className="hover:text-[#39ff14] transition-colors cursor-pointer">
                  {t('portal_committees_title')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('gallery')} className="hover:text-[#39ff14] transition-colors cursor-pointer">
                  {t('portal_gallery_title')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('projects')} className="hover:text-[#39ff14] transition-colors cursor-pointer">
                  {t('portal_projects_title')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('cultural')} className="hover:text-[#39ff14] transition-colors cursor-pointer">
                  {t('portal_cultural_title')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Committees */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-black uppercase tracking-wider border-b border-white/10 pb-2">
              {language === 'ar' ? 'اللجان التخصصية' : 'Specialized Committees'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Marketing • Media • PR</li>
              <li>Internal Relations (IR)</li>
              <li>Magic Hand • Charity</li>
              <li>Event Planning • Secretary</li>
              <li className="pt-2">
                <button onClick={() => handleNavigate('cv')} className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer">
                  <span>{t('cv_title')}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: PR & Sponsorship */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-black uppercase tracking-wider border-b border-white/10 pb-2">
              {t('pr_portal_title')}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ar' 
                ? 'لبحث فرص الشراكات المستدامة والرعايات الرسمية لملتقيات التوظيف:' 
                : 'For sponsorship and partnership opportunities:'}
            </p>
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/${prHeadPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-900/40 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>PR Head: {prHeadPhone}</span>
              </a>
              <a
                href={`https://wa.me/${prSubPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-900/40 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>PR Sub-Head: {prSubPhone}</span>
              </a>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            © 2026 Aliens Student Activity — Delta University Faculty of Pharmacy.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-[#39ff14]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role-Based Access Control Enforced
            </span>
            <span>Version 5.3 Enterprise</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
