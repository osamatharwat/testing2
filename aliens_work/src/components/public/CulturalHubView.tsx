import React, { useState } from 'react';
import { CulturalResource } from '../../types';
import { BookOpen, Download, Sparkles, Search, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface CulturalHubViewProps {
  resources: CulturalResource[];
  onOpenAuth: () => void;
}

export const CulturalHubView: React.FC<CulturalHubViewProps> = ({
  resources,
  onOpenAuth
}) => {
  const { isTeamMember } = useAuth();
  const { t, language, isRtl } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.section_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-xs font-black">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('cultural_badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t('cultural_title')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {t('cultural_sub')}
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('cultural_search')}
          className={`w-full ${isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'} py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none placeholder:text-slate-500`}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => {
          const isLocked = res.is_premium_only && !isTeamMember;
          return (
            <div
              key={res.id}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-5 shadow-xl group hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                    {res.section_name}
                  </span>
                  {res.is_premium_only && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{t('cultural_exclusive_badge')}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors leading-snug">
                  {res.title}
                </h3>

                {res.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div>
                {isLocked ? (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-black text-xs hover:bg-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('cultural_unlock_btn')}</span>
                  </button>
                ) : (
                  <a
                    href={res.resource_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('cultural_download_btn')}</span>
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
