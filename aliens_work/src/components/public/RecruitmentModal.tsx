import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  Building2,
  Phone,
  User,
  GraduationCap
} from 'lucide-react';
import { CommitteeKey, DynamicQuestion } from '../../types';
import { AppStore } from '../../lib/store';
import { isSupabaseConfigured, submitPublicApplication } from '../../lib/supabase';
import { cleanPhoneNumber } from '../../lib/whatsapp';
import confetti from 'canvas-confetti';

interface RecruitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCommittee?: CommitteeKey;
}

export const RecruitmentModal: React.FC<RecruitmentModalProps> = ({
  isOpen,
  onClose,
  preselectedCommittee
}) => {
  const committeesList = AppStore.getCommittees();
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [facultyLevel, setFacultyLevel] = useState('1');
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeKey>(preselectedCommittee || 'marketing');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [roleRequested, setRoleRequested] = useState('Member');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (preselectedCommittee) {
      setSelectedCommittee(preselectedCommittee);
    }
  }, [preselectedCommittee]);

  if (!isOpen) return null;

  // Fetch all relevant dynamic questions: Global + IR + Committee-specific
  const allQuestions = AppStore.getDynamicQuestions();
  const globalQuestions = allQuestions.filter(q => q.category === 'global');
  const irQuestions = allQuestions.filter(q => q.category === 'ir');
  const committeeQuestions = allQuestions.filter(q => q.category === 'committee' && q.committee_key === selectedCommittee);

  const activeQuestions: DynamicQuestion[] = [
    ...globalQuestions,
    ...committeeQuestions,
    ...irQuestions
  ];

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate core fields
    if (!applicantName.trim()) {
      setErrorMessage('يرجى كتابة الاسم الثلاثي على الأقل.');
      return;
    }

    const cleanPhone = cleanPhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('يرجى إدخال رقم هاتف / واتساب مصري أو دولي صحيح.');
      return;
    }

    // Validate required questions
    for (const q of activeQuestions) {
      if (q.is_required && (!answers[q.id] || !answers[q.id].trim())) {
        setErrorMessage(`يرجى الإجابة على السؤال المطلوب: "${q.question_text}"`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare readable dictionary for answers
      const structuredAnswers: Record<string, string> = {};
      activeQuestions.forEach(q => {
        structuredAnswers[q.question_text] = answers[q.id] || 'لم يتم الرد';
      });

      const commObj = committeesList.find(c => c.key === selectedCommittee);

      const committeeName = commObj ? `${commObj.name} (${commObj.name_ar})` : selectedCommittee;
      if (isSupabaseConfigured()) {
        const result = await submitPublicApplication({
          committeeKey: selectedCommittee,
          committeeName,
          applicantName: applicantName.trim(),
          phone: cleanPhone,
          facultyLevel,
          answers: structuredAnswers,
          roleRequested
        });
        if (!result.success) throw new Error(result.error || 'تعذر حفظ الطلب في Supabase');
      } else {
        if (!(import.meta as any).env?.DEV && (import.meta as any).env?.VITE_DEMO_MODE !== 'true') {
          throw new Error('استمارة التقديم غير مفعلة بدون اتصال Supabase.');
        }
        AppStore.addApplication({
          applicant_name: applicantName.trim(),
          phone: cleanPhone,
          faculty_level: facultyLevel,
          committee_key: selectedCommittee,
          committee_name: committeeName,
          dynamic_answers: structuredAnswers,
          role_requested: roleRequested
        });
      }

      setIsSuccess(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ طلب التقديم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            استمارة التقديم الرسمية • Aliens 2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            انضم إلى <span className="text-[#39ff14]">طاقم الفضاء</span> 🛸
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            املأ بياناتك بدقة لتحديد موعد المقابلة الشخصية (Interview) مع مسؤولي اللجان والعلاقات الداخلية (IR).
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#39ff14]/20 border border-[#39ff14] flex items-center justify-center text-[#39ff14] mx-auto text-3xl animate-bounce">
              🚀
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">تم استلام طلبك بنجاح!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                سيتواصل معك فريق العلاقات الداخلية (IR) عبر الواتساب <span className="text-[#39ff14] font-bold">({phone})</span> لتحديد موعد الانترفيو قريباً.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400">
              💡 يمكنك أيضاً إنشاء حساب مسجل على المنصة لمتابعة الفعاليات والمجتمع الثقافي.
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all cursor-pointer"
            >
              تم، إغلاق الاستمارة ✨
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="text-xs font-black text-[#39ff14] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-4 h-4" />
                1. البيانات الشخصية والأكاديمية
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">الاسم الثلاثي أو الرباعي *</label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="مثال: يوسف محمد علي"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">رقم الهاتف / الواتساب *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678 أو +201..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">الفرقة الدراسية بكلية الصيدلة *</label>
                  <select
                    value={facultyLevel}
                    onChange={(e) => setFacultyLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none"
                  >
                    <option value="1">الفرقة الأولى (First Year)</option>
                    <option value="2">الفرقة الثانية (Second Year)</option>
                    <option value="3">الفرقة الثالثة (Third Year)</option>
                    <option value="4">الفرقة الرابعة (Fourth Year)</option>
                    <option value="5">الفرقة الخامسة (Fifth Year - Clinical)</option>
                    <option value="Graduated">خريج (PharmD Alumni)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">اللجنة المراد الانضمام إليها *</label>
                  <select
                    value={selectedCommittee}
                    onChange={(e) => setSelectedCommittee(e.target.value as CommitteeKey)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-[#39ff14]/40 text-white text-xs focus:border-[#39ff14] focus:outline-none font-bold"
                  >
                    {committeesList.map(comm => (
                      <option key={comm.key} value={comm.key}>
                        {comm.name} — {comm.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Specialized Questions (Global + Committee + IR) */}
            <div className="space-y-4 pt-3 border-t border-white/10">
              <div className="text-xs font-black text-cyan-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  2. أسئلة التقييم (General + Committee + IR)
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeQuestions.length} أسئلة مخصصة
                </span>
              </div>

              {activeQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <label className="text-xs font-bold text-slate-200 leading-relaxed">
                      <span className="text-[#39ff14] ml-1 font-mono">#{idx + 1}</span> {q.question_text} {q.is_required && <span className="text-rose-400">*</span>}
                    </label>
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5 uppercase font-mono">
                      {q.category}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="اكتب إجابتك هنا بوضوح واختصار..."
                    required={q.is_required}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14]/60 focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-sm hover:brightness-110 shadow-[0_0_25px_rgba(57,255,20,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 fill-slate-950" />
              {isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الانضمام الآن 🚀'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
