import React, { useState } from 'react';
import { Profile } from '../../types';
import { AppStore } from '../../lib/store';
import { calculateMemberTier, TIERS } from '../../lib/gamification';
import { PublicProfileModal } from '../portal/PublicProfileModal';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Trophy, 
  Crown, 
  Star, 
  Award, 
  Search, 
  Users, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Medal,
  Zap
} from 'lucide-react';

export const HallOfFameView: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedCommittee, setSelectedCommittee] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingProfile, setInspectingProfile] = useState<Profile | null>(null);

  const profiles = AppStore.getProfiles().filter(p => p.membership_status === 'active_member');
  const evaluations = AppStore.getEvaluations();
  const committees = AppStore.getCommittees();

  // Enrich each profile with calculated gamification tier & score
  const membersWithTiers = profiles.map(p => {
    const gamified = calculateMemberTier(p.id, evaluations);
    return {
      profile: p,
      ...gamified
    };
  }).sort((a, b) => (b.totalXP - a.totalXP) || (b.averageScore - a.averageScore));

  const topPerformer = membersWithTiers.length > 0 ? membersWithTiers[0] : null;

  const filteredMembers = membersWithTiers.filter(m => {
    const matchesComm = selectedCommittee === 'all' || (m.profile.committee || m.profile.committee_key) === selectedCommittee;
    const matchesTier = selectedTier === 'all' || m.tier.tierNumber === parseInt(selectedTier);
    const matchesSearch = m.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.profile.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesComm && matchesTier && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>لوحة الشرف وتصنيف الطاقم الكوني (Hall of Fame)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          نخبة طاقم <span className="text-[#39ff14]">Aliens Space</span>
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          نظام التصنيف والرتب الشرفية المعتمد على طاقة الخبرة الكونية (XP)، التقييمات الشهرية، مشاركات حائط الذكريات، والمجتمع الثقافي.
        </p>
      </div>

      {/* 🌟 Spotlight: Alien of the Season / Top Performer */}
      {topPerformer && topPerformer.totalXP > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-transparent relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Crown className="w-48 h-48 text-amber-400" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
              <div className="relative">
                {topPerformer.profile.avatar_url ? (
                  <img
                    src={topPerformer.profile.avatar_url}
                    alt={topPerformer.profile.full_name}
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-4xl font-black text-amber-300 shadow-xl">
                    {topPerformer.profile.full_name.charAt(0)}
                  </div>
                )}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
                  👑
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>عضو الموسم المتميز (Top Cosmic Performer)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {topPerformer.profile.full_name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="text-amber-300 font-bold">{topPerformer.tier.titleAr} ({topPerformer.tier.tierNameAr})</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400 font-black">⚡ {topPerformer.totalXP} XP</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-bold uppercase">{topPerformer.profile.committee}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[#39ff14] font-black">{topPerformer.averageScore}% معدل</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectingProfile(topPerformer.profile)}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl shadow-amber-400/20 transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>عرض الملف والأوسمة</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">تصفية حسب اللجنة:</label>
          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
          >
            <option value="all">جميع اللجان (All Committees)</option>
            {committees.map(c => (
              <option key={c.key} value={c.key}>{c.name_ar} ({c.name})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">تصفية حسب الرتبة الكونية (Tier):</label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
          >
            <option value="all">جميع الرتب (All Tiers)</option>
            {TIERS.map(t => (
              <option key={t.tierNumber} value={t.tierNumber}>
                Tier {t.tierNumber}: {t.tierNameAr} ({t.titleAr})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">بحث بالاسم أو المنصب:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عضو..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((m, idx) => (
          <div
            key={m.profile.id}
            onClick={() => setInspectingProfile(m.profile)}
            className={`glass-panel p-6 rounded-3xl border border-white/10 hover:${m.tier.borderColor} transition-all cursor-pointer group shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-4`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {m.profile.avatar_url ? (
                      <img
                        src={m.profile.avatar_url}
                        alt={m.profile.full_name}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/15"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center text-xl font-black text-white">
                        {m.profile.full_name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 text-base" title={m.tier.tierNameAr}>
                      {m.tier.badgeIcon}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-white group-hover:text-[#39ff14] transition-colors line-clamp-1">
                      {m.profile.full_name}
                    </h3>
                    <p className="text-xs text-slate-400">{m.profile.position}</p>
                  </div>
                </div>

                <span className="text-xs font-black text-slate-500">#{idx + 1}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/5 border ${m.tier.borderColor} ${m.tier.colorClass}`}>
                  {m.tier.badgeIcon} {m.tier.tierNameAr}
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  ⚡ {m.totalXP} XP
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                  {m.profile.committee || 'General'}
                </span>
              </div>

              {/* Progress & Stats */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">معدل التقييم والأوسمة:</span>
                  <span className="text-[#39ff14] font-black">
                    {m.averageScore > 0 ? `${m.averageScore}%` : 'عضو نشط'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-[#39ff14] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (m.totalXP / 1800) * 100 || 15)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-white transition-colors">
              <span>عرض السجل الكوني والأوسمة</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#39ff14] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal View */}
      {inspectingProfile && (
        <PublicProfileModal
          profile={inspectingProfile}
          onClose={() => setInspectingProfile(null)}
        />
      )}
    </div>
  );
};
