import React, { useState } from 'react';
import { Profile, CommitteeKey } from '../../types';
import { AppStore } from '../../lib/store';
import { calculateMemberTier, TIERS } from '../../lib/gamification';
import { StoryCardModal } from '../profile/StoryCardModal';
import { useAuth } from '../../context/AuthContext';
import { canAccessMemberDirectory, canGenerateStoryCard } from '../../lib/permissions';
import { 
  Search, 
  Users, 
  Sparkles, 
  Award, 
  Share2, 
  Eye, 
  X, 
  Rocket, 
  ShieldCheck, 
  Calendar, 
  Star, 
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle2,
  Zap,
  Flame,
  Lock
} from 'lucide-react';

interface MemberDirectoryProps {
  onOpenStoryCard?: (profile: Profile) => void;
  onOpenAuth?: () => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({ onOpenAuth }) => {
  const { currentProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  
  // Selected Profile for the Public Profile Modal
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  // Selected Profile for Story Card Generation (Self only)
  const [storyCardMember, setStoryCardMember] = useState<Profile | null>(null);

  // Check guest directory restriction
  const hasDirectoryAccess = canAccessMemberDirectory(currentProfile);

  if (!hasDirectoryAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-black border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              منطقة أعضاء الفريق المعتمدين فقط
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">دليل وبحث الأعضاء محمي ومقيد 🔒</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              للحفاظ على خصوصية وسرية بيانات طاقم Aliens Student Activity، لا يُسمح للزوار أو الحسابات غير المفعلة باستعراض أو البحث في دليل الأعضاء.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenAuth ? (
              <button
                onClick={onOpenAuth}
                className="px-8 py-3.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                تسجيل الدخول / تفعيل كود العضوية
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const allProfiles = AppStore.getProfiles().filter(p => p.role !== 'guest' && p.membership_status === 'active_member');
  const allEvaluations = AppStore.getEvaluations();
  const allCommittees = AppStore.getCommittees();

  const filteredProfiles = allProfiles.filter(p => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchSearch = !searchLower || 
      p.full_name.toLowerCase().includes(searchLower) ||
      (p.username && p.username.toLowerCase().includes(searchLower)) ||
      (p.committee && p.committee.toLowerCase().includes(searchLower)) ||
      (p.position && p.position.toLowerCase().includes(searchLower)) ||
      (p.bio && p.bio.toLowerCase().includes(searchLower));

    const matchComm = committeeFilter === 'all' || 
      p.committee === committeeFilter || 
      p.committee_key === committeeFilter;

    if (tierFilter !== 'all') {
      const gamified = calculateMemberTier(p.id, allEvaluations);
      if (String(gamified.tier.tierNumber) !== tierFilter) return false;
    }

    return matchSearch && matchComm;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      
      {/* Directory Hero Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 text-xs font-black">
          <Users className="w-3.5 h-3.5" />
          دليل طاقم Aliens Student Activity • صيدلة الدلتا
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          دليل وبحث أعضاء الفريق 🛸
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          استكشف ملفات أعضاء وقيادات الطاقم، تعرف على رتبهم الكونية وإنجازاتهم، ويمكنك مشاركة بطاقتك الشخصية في استوري إنستغرام وفيسبوك.
        </p>
      </div>

      {/* Search & Filtering Hub */}
      <div className="space-y-4 p-4 sm:p-6 rounded-3xl glass-panel border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، اسم المستخدم @username، المنصب، أو التخصص..."
              className="w-full pl-3 pr-10 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs sm:text-sm focus:border-[#39ff14] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3.5 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
            >
              <option value="all">جميع الرتب الكونية 🌟</option>
              <option value="5">🌟 أسطورة المجرة (Galactic Legend)</option>
              <option value="4">💎 رائد فضاء فائق (Cosmic Pioneer)</option>
              <option value="3">🟢 كشاف نجمي (Star Scout)</option>
              <option value="2">⚡ مستكشف مداري (Orbital Explorer)</option>
              <option value="1">🪐 مستجد كوني (Cosmic Cadet)</option>
            </select>
          </div>
        </div>

        {/* Committee Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-white/5 pt-3">
          <button
            onClick={() => setCommitteeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              committeeFilter === 'all'
                ? 'bg-[#39ff14] text-slate-950 shadow-md shadow-[#39ff14]/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            جميع اللجان ({allProfiles.length})
          </button>

          {allCommittees.map((comm) => (
            <button
              key={comm.key}
              onClick={() => setCommitteeFilter(comm.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                committeeFilter === comm.key
                  ? 'bg-[#39ff14] text-slate-950 shadow-md shadow-[#39ff14]/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {comm.name_ar}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/10 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">لم يتم العثور على أعضاء مطابقين</h3>
          <p className="text-xs text-slate-400">جرب كتابة اسم مختلف أو إزالة الفلاتر المحددة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((profile) => {
            const gamified = calculateMemberTier(profile.id, allEvaluations);
            const isSelf = currentProfile?.id === profile.id;

            return (
              <div
                key={profile.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-[#39ff14]/40 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=07101d&color=39ff14`}
                      alt={profile.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 group-hover:border-[#39ff14] transition-all shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-white truncate">{profile.full_name}</h3>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full bg-[#39ff14]/20 text-[#39ff14] text-[10px] font-black border border-[#39ff14]/40">
                            أنت 👽
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        @{profile.username || 'member'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#39ff14] font-bold">
                        <span>{profile.position}</span>
                        <span>•</span>
                        <span className="text-slate-300 uppercase">{profile.committee || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier & XP Mini Badge */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                    <span className={`font-black flex items-center gap-1.5 ${gamified.tier.colorClass}`}>
                      <span>{gamified.tier.badgeIcon}</span>
                      <span>{gamified.tier.tierNameAr}</span>
                    </span>
                    <span className="font-mono text-amber-300 font-black">
                      ⚡ {gamified.totalXP} XP
                    </span>
                  </div>

                  {profile.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setSelectedMember(profile)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#39ff14]" />
                    <span>عرض البروفايل</span>
                  </button>

                  {/* Strict Privacy: Story Card ONLY for Self */}
                  {isSelf && (
                    <button
                      onClick={() => setStoryCardMember(profile)}
                      title="مشاركة بروفايلي في استوري إنستا وفيسبوك"
                      className="px-3 py-2.5 rounded-xl bg-[#39ff14]/10 hover:bg-[#39ff14]/20 border border-[#39ff14]/30 text-[#39ff14] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>الاستوري</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 👤 MODAL 1: RICH PUBLIC MEMBER PROFILE MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            {(() => {
              const gamified = calculateMemberTier(selectedMember.id, allEvaluations);
              const memberEvals = allEvaluations.filter(e => e.member_id === selectedMember.id);
              const isSelf = currentProfile?.id === selectedMember.id;

              return (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right border-b border-white/10 pb-6">
                    <img
                      src={selectedMember.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.full_name)}&background=07101d&color=39ff14`}
                      alt={selectedMember.full_name}
                      className="w-24 h-24 rounded-3xl object-cover border-3 border-[#39ff14] shadow-xl"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-2xl font-black text-white">{selectedMember.full_name}</h2>
                        <span className="text-xs font-mono text-[#39ff14] bg-[#39ff14]/10 px-2.5 py-0.5 rounded-full border border-[#39ff14]/30">
                          @{selectedMember.username || 'member'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium">
                        لجنة: <span className="text-white font-bold">{selectedMember.committee ? selectedMember.committee.toUpperCase() : 'General Crew'}</span> • المنصب: <span className="text-[#39ff14] font-bold">{selectedMember.position}</span>
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <span className={`text-xs font-black px-3 py-1 rounded-full border ${gamified.tier.borderColor} ${gamified.tier.colorClass} bg-white/5`}>
                          {gamified.tier.badgeIcon} {gamified.tier.tierNameAr} ({gamified.tier.tierNameEn})
                        </span>
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                          ⚡ {gamified.totalXP} TOTAL COSMIC XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio & Details */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">نبذة شخصية</h4>
                      <p className="text-xs text-slate-300 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5 leading-relaxed">
                        {selectedMember.bio || 'طالب بكلية الصيدلة — جامعة الدلتا للعلوم والتكنولوجيا، عضو متميز في طاقم Aliens Student Activity.'}
                      </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 font-bold block">الفرقة الدراسية</span>
                        <span className="text-xs font-black text-white">Level {selectedMember.faculty_level || '1'}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 font-bold block">التقييمات المعتمدة</span>
                        <span className="text-xs font-black text-[#39ff14]">{memberEvals.length} تقييم</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 font-bold block">حالة العضوية</span>
                        <span className="text-xs font-black text-emerald-400">عضو معتمد ✓</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      {isSelf && (
                        <button
                          onClick={() => {
                            const target = selectedMember;
                            setSelectedMember(null);
                            setStoryCardMember(target);
                          }}
                          className="w-full sm:flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>مشاركة بطاقتي في استوري إنستا وفيسبوك 🛸</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedMember(null)}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        إغلاق
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🛸 MODAL 2: INSTAGRAM & FACEBOOK STORY CARD GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {storyCardMember && (
        <StoryCardModal
          isOpen={!!storyCardMember}
          onClose={() => setStoryCardMember(null)}
          profile={storyCardMember}
        />
      )}

    </div>
  );
};
