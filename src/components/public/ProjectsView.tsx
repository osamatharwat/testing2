import React from 'react';
import { MemberProject } from '../../types';
import { Lightbulb, ExternalLink, MessageCircle, Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ProjectsViewProps {
  projects: MemberProject[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25 text-xs font-black">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{t('projects_badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t('projects_title')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {t('projects_sub')}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-[#39ff14]/40 transition-all flex flex-col justify-between shadow-xl group hover:-translate-y-1"
          >
            <div>
              {/* Media Thumbnail */}
              {proj.image_url && (
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={proj.image_url}
                    alt={proj.project_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-[#39ff14] border border-[#39ff14]/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'ar' ? 'مشروع معتمد' : 'Verified Project'}</span>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-[#39ff14] transition-colors leading-snug">
                    {proj.project_title}
                  </h3>
                  {proj.author_name && (
                    <p className="text-xs text-cyan-400 font-bold mt-1">
                      {t('projects_by')} {proj.author_name}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {proj.description}
                </p>

                {/* Tags */}
                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Links */}
            <div className="p-6 pt-0 flex flex-wrap gap-2">
              {proj.project_link && (
                <a
                  href={proj.project_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('projects_link_btn')}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {proj.contact_phone && (
                <a
                  href={`https://wa.me/${proj.contact_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{t('projects_contact_btn')}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
