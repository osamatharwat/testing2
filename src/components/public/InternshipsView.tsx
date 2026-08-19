import React from 'react';
import { Internship } from '../../types';
import { Briefcase, Building, ExternalLink, Calendar, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface InternshipsViewProps {
  internships: Internship[];
  onOpenAuth: () => void;
}

export const InternshipsView: React.FC<InternshipsViewProps> = ({
  internships,
  onOpenAuth
}) => {
  const { isTeamMember } = useAuth();
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-black">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{t('internships_badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t('internships_title')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {t('internships_sub')}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {internships.map((int) => {
          const isLocked = int.is_exclusive_to_members && !isTeamMember;
          return (
            <div
              key={int.id}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-[#39ff14]/40 transition-all flex flex-col justify-between space-y-6 shadow-xl group hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black text-[#39ff14]">
                      <Building className="w-4 h-4" />
                      <span>{int.company_name}</span>
                    </div>
                    <h3 className="text-xl font-black text-white group-hover:text-[#39ff14] transition-colors leading-snug">
                      {int.title}
                    </h3>
                  </div>

                  {int.is_exclusive_to_members && (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{t('cultural_exclusive_badge')}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {int.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/10">
                  {int.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{int.location}</span>
                    </div>
                  )}
                  {int.deadline && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('internships_deadline')} {int.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {isLocked ? (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-300 font-black text-xs hover:bg-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('cultural_unlock_btn')}</span>
                  </button>
                ) : (
                  <a
                    href={int.apply_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('internships_apply_btn')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
