import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppStore } from '../../lib/store';
import { isSupabaseConfigured } from '../../lib/supabase';
import { canViewMemberEvaluations } from '../../lib/permissions';
import { calculateMemberTier, TIERS } from '../../lib/gamification';
import { StoryCardModal } from '../profile/StoryCardModal';
import { 
  User, 
  KeyRound, 
  Award, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Star,
  Users,
  Sparkles,
  Zap,
  Target,
  Share2
} from 'lucide-react';

export const MemberProfile: React.FC = () => {
  const { currentProfile, updateProfileData } = useAuth();
  
  const [fullName, setFullName] = useState(currentProfile?.full_name || '');
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [phone, setPhone] = useState(currentProfile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatar_url || '');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!currentProfile) {
    return (
      <div className="max-w-md mx-auto p-12 text-center text-slate-400">
        يرجى تسجيل الدخول لعرض الملف الشخصي.
      </div>
    );
  }

  // Fetch evaluations for this member
  const allEvaluations = AppStore.getEvaluations();
  const myEvaluations = allEvaluations.filter(e => e.member_id === currentProfile.id);
  const gamified = calculateMemberTier(currentProfile.id, allEvaluations);

  // Check if current viewer is authorized to view evaluations for this profile
  const canViewEvals = canViewMemberEvaluations(currentProfile, currentProfile);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileData({
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      phone: phone.trim(),
      avatar_url: avatarUrl.trim() || undefined
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeFeedback(null);

    if (isSupabaseConfigured()) {
      setCodeFeedback({ type: 'error', text: 'تفعيل أكواد العضوية من المتصفح غير مسموح في وضع Supabase؛ أرسل الكود للإدارة للمراجعة.' });
      return;
    }

    const res = AppStore.verifyAndRedeemCode(accessCodeInput, currentProfile.id, currentProfile.full_name);
    if (!res.valid) {
      setCodeFeedback({ type: 'error', text: res.error || 'كود غير صحيح' });
      return;
    }

    const codeObj = res.codeObj!;
    updateProfileData({
      role: codeObj.role,
      position: codeObj.position,
      committee: codeObj.committee,
      committee_key: codeObj.committee,
      committee_position: codeObj.position,
      membership_status: 'active_member',
      is_board_member: codeObj.position === 'Head' || codeObj.position === 'Leader' || codeObj.position === 'Board Member',
      access_code_used: codeObj.code
    });

    setCodeFeedback({
      type: 'success',
      text: `مبروك! تم تفعيل عضويتك كـ ${codeObj.position} في لجنة ${codeObj.committee.toUpperCase()} بنجاح 🚀`
    });
    setAccessCodeInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25 text-xs font-black">
          <User className="w-3.5 h-3.5" />
          الملف التعريفي لعضو الطاقم
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          ملفي <span className="text-[#39ff14]">الشخصي</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          إدارة البيانات الشخصية، ترقية العضوية، واستعراض سجل التقييمات الشهرية المعتمدة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar: User Info Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center space-y-4 shadow-xl">
            <div className="relative w-28 h-28 mx-auto">
              <img
                src={currentProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.full_name)}&background=07101d&color=39ff14`}
                alt={currentProfile.full_name}
                className="w-full h-full rounded-3xl object-cover border-2 border-[#39ff14]/40 p-1 bg-slate-900 shadow-[0_0_20px_rgba(57,255,20,0.2)]"
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-white leading-tight">
                {currentProfile.full_name}
              </h2>
              <p className="text-xs text-slate-400">@{currentProfile.username}</p>
              <p className="text-xs text-slate-300 font-bold">{currentProfile.email}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                {currentProfile.role.toUpperCase()}
              </span>
              {currentProfile.committee && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30">
                  {currentProfile.committee.toUpperCase()}
                </span>
              )}
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {currentProfile.position}
              </span>
              {currentProfile.is_board_member && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  Board Member
                </span>
              )}
            </div>

            {/* Story Card Share CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStoryModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#39ff14] via-emerald-400 to-teal-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة بروفايلي في استوري إنستا وفيسبوك 🛸✨</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-1.5 text-right">
              <div className="flex justify-between">
                <span>حالة العضوية:</span>
                <span className="font-bold text-[#39ff14]">
                  {currentProfile.membership_status === 'active_member' ? 'عضو نشط (Active)' : 'مستخدم مسجل (Guest)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>تاريخ الانضمام:</span>
                <span className="text-slate-300">{new Date(currentProfile.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
              {currentProfile.assigned_ir && (
                <div className="flex justify-between">
                  <span>مسؤول الـ IR:</span>
                  <span className="text-cyan-400 font-bold">معين ومسند</span>
                </div>
              )}
            </div>
          </div>

          {/* Access Code Activation Box (For Registered Users or Upgrades) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <KeyRound className="w-4 h-4 text-[#39ff14]" />
              تفعيل كود العضوية / الترقية
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              إذا استلمت كود دخول معتمد من إدارة التيم أو لجنة الـ IR، أدخله هنا لتفعيل عضويتك فورياً.
            </p>

            {codeFeedback && (
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                codeFeedback.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
              }`}>
                {codeFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{codeFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleRedeemCode} className="space-y-3">
              <input
                type="text"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                placeholder="مثال: MARKETING-2026-X7K9"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none uppercase font-mono tracking-wider"
              />
              <button
                type="submit"
                disabled={!accessCodeInput.trim()}
                className="w-full py-2.5 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                تحقق وتفعيل الكود 🚀
              </button>
            </form>
          </div>
        </div>

        {/* Main Content: Gamification Tier Showcase, Edit Settings & Evaluations */}
        <div className="lg:col-span-2 space-y-8">

          {/* 🌟 Gamification Tier & Honor Title Card */}
          <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${gamified.tier.bgGradient} border ${gamified.tier.borderColor} shadow-2xl space-y-6 relative overflow-hidden`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-right">
                <span className="text-4xl filter drop-shadow-md">{gamified.tier.badgeIcon}</span>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-black uppercase text-slate-300">الرتبة الكونية</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black bg-white/10 ${gamified.tier.colorClass}`}>
                      Tier {gamified.tier.tierNumber}: {gamified.tier.tierNameAr}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {gamified.tier.titleAr} <span className="text-xs text-slate-400 font-normal">({gamified.tier.titleEn})</span>
                  </h3>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-center sm:text-left bg-slate-950/50 px-4 py-2 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400">إجمالي نقاط الخبرة (Cosmic XP)</div>
                  <div className="text-xl font-black text-amber-300">
                    ⚡ {gamified.totalXP} XP
                  </div>
                </div>

                <div className="text-center sm:text-left bg-slate-950/50 px-4 py-2 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400">المعدل التراكمي العام</div>
                  <div className="text-xl font-black text-[#39ff14]">
                    {gamified.averageScore > 0 ? `${gamified.averageScore}%` : 'عضو جديد'}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Tier Progress Bar */}
            {gamified.nextTier && (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>التقدم نحو {gamified.nextTier.badgeIcon} {gamified.nextTier.tierNameAr} ({gamified.nextTier.titleAr})</span>
                  <span className="text-[#39ff14] font-black">{gamified.progressToNext}% ({gamified.totalXP}/{gamified.nextTier.minXP} XP)</span>
                </div>
                <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-[#39ff14] h-full rounded-full transition-all duration-700 shadow-md"
                    style={{ width: `${gamified.progressToNext}%` }}
                  />
                </div>
              </div>
            )}

            {/* XP Activities Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-slate-400 text-[10px] block">📸 ذكريات منشورة</span>
                <span className="font-black text-white">{gamified.activityCounts.memoriesCount} (+{gamified.xpBreakdown.memoriesXP} XP)</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-slate-400 text-[10px] block">📚 مساهمات ثقافية</span>
                <span className="font-black text-white">{gamified.activityCounts.culturalCount} (+{gamified.xpBreakdown.culturalXP} XP)</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-slate-400 text-[10px] block">💡 مشاريع منجزة</span>
                <span className="font-black text-white">{gamified.activityCounts.projectsCount} (+{gamified.xpBreakdown.projectsXP} XP)</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-slate-400 text-[10px] block">🎟️ حضور فعاليات</span>
                <span className="font-black text-white">{gamified.activityCounts.eventsCount} (+{gamified.xpBreakdown.eventsXP} XP)</span>
              </div>
            </div>

            {/* Achievements Matrix */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-black text-white">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  أوسمة التميز المكتسبة ({gamified.achievements.filter(a => a.unlocked).length}/{gamified.achievements.length})
                </span>
                <span className="text-[11px] text-slate-400 font-normal">تمنح تلقائياً عند استيفاء معايير التقييم</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gamified.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      ach.unlocked
                        ? 'bg-amber-950/25 border-amber-500/40 shadow-sm'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{ach.icon}</span>
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
          </div>
          
          {/* Edit Profile Form */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5 shadow-xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              تعديل البيانات الأساسية
            </h3>

            {saveSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                تم حفظ وتحديث بيانات حسابك بنجاح!
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">الاسم الكامل</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">اسم المستخدم (Username)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">رقم الهاتف (الواتساب)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">رابط الصورة الرمزية (Avatar URL)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نبذة تعريفية (Bio)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة عن دورك في التيم أو تخصصك في كلية الصيدلة..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs hover:brightness-110 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                حفظ التعديلات 💾
              </button>
            </form>
          </div>

          {/* Performance Evaluations History (Strict Visibility Policy) */}
          {canViewEvals && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#39ff14]" />
                    سجل التقييم الشهري (Performance History)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    التقييمات المعتمدة من مسؤولي الـ IR ورؤساء اللجان (لا يتم مسح السجل القديم).
                  </p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25">
                  {myEvaluations.length} تقييم مسجل
                </span>
              </div>

              {myEvaluations.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-slate-400 text-xs space-y-2">
                  <FileCheck className="w-8 h-8 mx-auto text-slate-500" />
                  <p>لم يتم تسجيل أي تقييمات لك حتى الآن.</p>
                  <p className="text-[11px] text-slate-500">يقوم مسؤولو الـ IR بتسجيل التقييم شهرياً بناءً على الأداء والمهام.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myEvaluations.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white">
                              تقييم شهر {ev.evaluation_month}
                            </span>
                            <p className="text-[11px] text-slate-400">
                              المُقيّم: {ev.evaluator_name} ({ev.evaluator_role.toUpperCase()})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">الدرجة الإجمالية:</span>
                          <span className={`text-base font-black px-3 py-1 rounded-xl border ${
                            ev.score >= 90
                              ? 'bg-emerald-950/80 text-[#39ff14] border-[#39ff14]/40'
                              : ev.score >= 75
                              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}>
                            {ev.score} / 100
                          </span>
                        </div>
                      </div>

                      {/* Criteria scores breakdown if available */}
                      {ev.criteria_scores && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                            <p className="text-[10px] text-slate-400">الحضور</p>
                            <p className="font-black text-slate-200">{ev.criteria_scores.attendance}/20</p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                            <p className="text-[10px] text-slate-400">المشاركة</p>
                            <p className="font-black text-slate-200">{ev.criteria_scores.participation}/20</p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                            <p className="text-[10px] text-slate-400">جودة المهام</p>
                            <p className="font-black text-slate-200">{ev.criteria_scores.tasks_quality}/20</p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                            <p className="text-[10px] text-slate-400">العمل الجماعي</p>
                            <p className="font-black text-slate-200">{ev.criteria_scores.teamwork}/20</p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                            <p className="text-[10px] text-slate-400">التواصل</p>
                            <p className="font-black text-slate-200">{ev.criteria_scores.communication}/20</p>
                          </div>
                        </div>
                      )}

                      {/* Notes & Recommendation */}
                      <div className="space-y-1.5 text-xs">
                        <p className="text-slate-400 font-bold">ملاحظات التقييم:</p>
                        <p className="text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-white/5">
                          {ev.notes}
                        </p>
                        {ev.recommendation && (
                          <p className="text-cyan-300 text-[11px] pt-1">
                            💡 التوصية: {ev.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Story Card Modal */}
      {storyModalOpen && currentProfile && (
        <StoryCardModal
          isOpen={storyModalOpen}
          onClose={() => setStoryModalOpen(false)}
          profile={currentProfile}
        />
      )}

    </div>
  );
};
