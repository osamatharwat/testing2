import React from 'react';
import { Profile } from '../../types';
import { AppStore } from '../../lib/store';
import { calculateMemberTier, TIERS } from '../../lib/gamification';
import { canViewMemberEvaluations, canViewMemberPhone } from '../../lib/permissions';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Award, 
  Star, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  User, 
  Sparkles,
  Zap,
  Target,
  Users,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { formatWhatsAppUrl } from '../../lib/whatsapp';

interface PublicProfileModalProps {
  profile: Profile | null;
  onClose: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ profile, onClose }) => {
  const { currentProfile } = useAuth();

  if (!profile) return null;

  const evaluations = AppStore.getEvaluations();
  const gamified = calculateMemberTier(profile.id, evaluations);
  const canSeeDetailedEvals = canViewMemberEvaluations(currentProfile, profile);
  const canSeePhone = canViewMemberPhone(currentProfile, profile);

  const waLink = (canSeePhone && profile.phone) ? formatWhatsAppUrl(profile.phone, `مرحباً ${profile.full_name}، نتواصل معك من نشاط Aliens الطلابي.`) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Card with Tier Glow */}
        <div className={`p-6 rounded-3xl bg-gradient-to-r ${gamified.tier.bgGradient} border ${gamified.tier.borderColor} flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right shadow-xl`}>
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-lg">
                {profile.full_name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 text-2xl filter drop-shadow-md" title={gamified.tier.tierNameAr}>
              {gamified.tier.badgeIcon}
            </span>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{profile.full_name}</h2>
              <span className={`px-3 py-0.5 rounded-full text-xs font-black bg-white/10 border ${gamified.tier.borderColor} ${gamified.tier.colorClass} flex items-center gap-1`}>
                <span>{gamified.tier.badgeIcon}</span>
                <span>Tier {gamified.tier.tierNumber}: {gamified.tier.tierNameAr}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                {profile.position}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30 font-bold uppercase">
                لجنة {profile.committee || profile.committee_key || 'عام'}
              </span>
              {profile.faculty_level && (
                <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10 font-bold">
                  الفرقة {profile.faculty_level}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              {profile.bio || 'عضو فاعل ومتميز في نشاط Aliens بكلية الصيدلة — جامعة الدلتا.'}
            </p>
          </div>
        </div>

        {/* Tier & Overall Performance Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
            <div className="text-[10px] font-bold text-slate-400">اللقب الشرفي الكوني</div>
            <div className={`text-xs font-black ${gamified.tier.colorClass}`}>
              {gamified.tier.titleAr}
            </div>
            <div className="text-[9px] text-slate-500">{gamified.tier.titleEn}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
            <div className="text-[10px] font-bold text-slate-400">طاقة الخبرة (Cosmic XP)</div>
            <div className="text-base sm:text-lg font-black text-amber-300">
              ⚡ {gamified.totalXP} XP
            </div>
            <div className="text-[9px] text-slate-500">Tier {gamified.tier.tierNumber}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
            <div className="text-[10px] font-bold text-slate-400">المعدل التراكمي العام</div>
            <div className="text-base sm:text-lg font-black text-[#39ff14]">
              {gamified.averageScore > 0 ? `${gamified.averageScore}%` : 'عضو جديد'}
            </div>
            <div className="text-[9px] text-slate-500">{gamified.totalEvaluations} دورات معتمدة</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
            <div className="text-[10px] font-bold text-slate-400">آخر تقييم شهري</div>
            <div className="text-base sm:text-lg font-black text-cyan-300">
              {gamified.latestScore !== null ? `${gamified.latestScore}/100` : '—'}
            </div>
            <div className="text-[9px] text-slate-500">الأداء الأخير</div>
          </div>
        </div>

        {/* Activity Badges Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">📸 ذكريات</span>
            <span className="font-bold text-white text-xs">{gamified.activityCounts.memoriesCount} مشاركة</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">📚 مقالات ونقاشات</span>
            <span className="font-bold text-white text-xs">{gamified.activityCounts.culturalCount} موضوع</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">💡 مشاريع منشورة</span>
            <span className="font-bold text-white text-xs">{gamified.activityCounts.projectsCount} مشروع</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">🎟️ حضور فعاليات</span>
            <span className="font-bold text-white text-xs">{gamified.activityCounts.eventsCount} فعالية</span>
          </div>
        </div>

        {/* Achievements & Badges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>أوسمة الإنجاز والتفوق الكوني (Achievements):</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {gamified.achievements.filter(a => a.unlocked).length} / {gamified.achievements.length} أوسمة مكتسبة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gamified.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  ach.unlocked
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                    : 'bg-white/[0.02] border-white/5 opacity-50'
                }`}
              >
                <span className="text-2xl shrink-0 filter drop-shadow-sm">{ach.icon}</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>
                      {ach.titleAr}
                    </span>
                    {ach.unlocked && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-black">
                        مكتسب ✨
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{ach.descAr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Evaluation History (Protected by Permissions) */}
        {canSeeDetailedEvals ? (
          <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
            <h3 className="text-xs font-black text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#39ff14]" />
              <span>سجل التقييمات الشهرية المعتمد:</span>
            </h3>

            {gamified.scoreHistory.length > 0 ? (
              <div className="space-y-2">
                {gamified.scoreHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      شهر: {item.month}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-[#39ff14] h-full rounded-full" 
                          style={{ width: `${item.score}%` }} 
                        />
                      </div>
                      <span className="font-black text-[#39ff14] w-12 text-left">{item.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">لا توجد تقييمات شهرية مسجلة بعد لهذا العضو.</p>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>تفاصيل التقييمات الشهرية الفردية مشفرة ومتاحة فقط للعضو نفسه ومقيمي الـ IR وقيادة لجنته.</span>
          </div>
        )}

        {/* WhatsApp Quick Link */}
        {waLink && (
          <div className="pt-2 flex justify-end">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[#25D366] text-slate-950 font-black text-xs flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#25D366]/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>محادثة واتساب سريعة</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
