import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppStore } from '../../lib/store';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AccessCode } from '../../types';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Check,
  Zap,
  FolderOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, currentProfile } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [facultyLevel, setFacultyLevel] = useState('1');
  const [accessCode, setAccessCode] = useState('');
  const [showLoginCodeInput, setShowLoginCodeInput] = useState(false);
  
  // Live code validation
  const [codeValidation, setCodeValidation] = useState<{
    tested: boolean;
    valid: boolean;
    codeObj?: AccessCode;
    error?: string;
  }>({ tested: false, valid: false });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Access Code Validator
  useEffect(() => {
    const clean = accessCode.trim().toUpperCase();
    if (!clean) {
      setCodeValidation({ tested: false, valid: false });
      return;
    }

    const allCodes = AppStore.getAccessCodes();
    const found = allCodes.find(c => c.code.toUpperCase() === clean);

    if (!found) {
      setCodeValidation({ tested: true, valid: false, error: 'الكود غير مسجل بالنظام' });
    } else if (!found.is_active) {
      setCodeValidation({ tested: true, valid: false, error: 'هذا الكود غير نشط حالياً' });
    } else if (found.current_uses >= found.max_uses) {
      setCodeValidation({ tested: true, valid: false, error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكود' });
    } else {
      setCodeValidation({ tested: true, valid: true, codeObj: found });
    }
  }, [accessCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(emailOrUsername.trim(), password);
        if (!res.success) {
          setErrorMsg(res.error || 'فشل تسجيل الدخول، تحقق من البيانات المدخلة');
        } else {
          // In cloud mode, access codes must never grant roles from the browser.
          if (accessCode.trim() && isSupabaseConfigured()) {
            setSuccessMsg('تم تسجيل الدخول بنجاح. تم استلام كود العضوية وسيتم مراجعته ومنح الصلاحية من الإدارة. 🚀');
            setTimeout(() => onClose(), 1200);
          } else if (accessCode.trim()) {
            const currentList = AppStore.getProfiles();
            const loggedInUser = currentList.find(
              p => p.email.toLowerCase() === emailOrUsername.trim().toLowerCase() || 
                   p.username.toLowerCase() === emailOrUsername.trim().toLowerCase()
            );

            if (loggedInUser) {
              const verify = AppStore.verifyAndRedeemCode(accessCode.trim(), loggedInUser.id, loggedInUser.full_name);
              if (verify.valid && verify.codeObj) {
                loggedInUser.role = verify.codeObj.role;
                loggedInUser.membership_status = 'active_member';
                loggedInUser.committee = verify.codeObj.committee;
                loggedInUser.committee_key = verify.codeObj.committee;
                loggedInUser.position = verify.codeObj.position;
                loggedInUser.committee_position = verify.codeObj.position;
                loggedInUser.access_code_used = verify.codeObj.code;
                loggedInUser.is_board_member = ['Head', 'Leader', 'Board Member'].includes(verify.codeObj.position);
                AppStore.saveProfile(loggedInUser);
                setSuccessMsg(`تم تسجيل الدخول وترقيتك بنجاح إلى (${verify.codeObj.committee.toUpperCase()} • ${verify.codeObj.position})! 🚀`);
                confetti({ particleCount: 70, spread: 80 });
              } else {
                setSuccessMsg('تم تسجيل الدخول بنجاح! 🚀');
              }
            } else {
              setSuccessMsg('تم تسجيل الدخول بنجاح! 🚀');
            }
          } else {
            setSuccessMsg('تم تسجيل الدخول بنجاح! 🚀');
          }

          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        // Signup
        if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
          setErrorMsg('يرجى ملء جميع الحقول المطلوبة');
          setIsSubmitting(false);
          return;
        }

        const res = await signup(
          fullName.trim(),
          username.trim().toLowerCase(),
          email.trim().toLowerCase(),
          password,
          accessCode.trim() || undefined
        );

        if (!res.success) {
          setErrorMsg(res.error || 'فشل إنشاء الحساب');
        } else {
          if (accessCode.trim() && codeValidation.valid) {
            setSuccessMsg(`مبروك! تم إنشاء حسابك وتعيينك مباشرة في لجنة (${codeValidation.codeObj?.committee.toUpperCase()}) برتبة ${codeValidation.codeObj?.position}! 🚀`);
            confetti({ particleCount: 80, spread: 90 });
          } else {
            setSuccessMsg('تم إنشاء حسابك بنجاح كمستخدم مسجل. يمكنك تفعيل كود الترقية في أي وقت.');
          }
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] text-xs font-black border border-[#39ff14]/25">
            <Sparkles className="w-3.5 h-3.5" />
            بوابة الدخول والانضمام • Aliens Delta
          </div>
          <h2 className="text-2xl font-black text-white">
            {mode === 'login' ? 'تسجيل الدخول والترقية 🛸' : 'إنشاء حساب والانضمام 🚀'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'سجل دخولك وأدخل كود الترقية للالتحاق بلجنتك فوراً'
              : 'انضم لمجتمع صيدلة الدلتا وقم بتفعيل كود الترقية'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#39ff14] text-slate-950 shadow-md shadow-[#39ff14]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول 🔑
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#39ff14] text-slate-950 shadow-md shadow-[#39ff14]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            حساب جديد 🚀
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#39ff14]" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">البريد الإلكتروني أو اسم المستخدم</label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="name@example.com أو user_name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                />
              </div>

              {/* Optional Access Code on Login */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowLoginCodeInput(!showLoginCodeInput)}
                  className="text-xs text-[#39ff14] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showLoginCodeInput ? 'إخفاء حقل كود الترقية' : 'لديك كود ترقية أو انضمام للجنة؟'}</span>
                </button>

                {showLoginCodeInput && (
                  <div className="mt-2 p-3 rounded-2xl bg-white/[0.03] border border-[#39ff14]/30 space-y-2 animate-in fade-in">
                    <label className="text-[11px] font-bold text-slate-300 block">كود الترقية (Access Code)</label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="مثال: HEAD-MARKETING-2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono uppercase tracking-wider text-left"
                      dir="ltr"
                    />

                    {codeValidation.tested && (
                      <div className={`text-[11px] font-bold flex items-center gap-1.5 ${codeValidation.valid ? 'text-[#39ff14]' : 'text-rose-400'}`}>
                        {codeValidation.valid ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>كود ترقية معتمد: لجنة {codeValidation.codeObj?.committee.toUpperCase()} ({codeValidation.codeObj?.position})</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{codeValidation.error}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">الاسم الرباعي *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: يوسف أحمد السعيد"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">اسم المستخدم (Username) *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="youssef_ahmed"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs text-left focus:border-[#39ff14] focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">الفرقة الدراسية</label>
                  <select
                    value={facultyLevel}
                    onChange={(e) => setFacultyLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  >
                    <option value="1">الفرقة الأولى</option>
                    <option value="2">الفرقة الثانية</option>
                    <option value="3">الفرقة الثالثة</option>
                    <option value="4">الفرقة الرابعة</option>
                    <option value="5">الفرقة الخامسة</option>
                    <option value="Graduated">خريج صيدلة</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@delta.edu.eg"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs text-left focus:border-[#39ff14] focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">كلمة المرور *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs text-left focus:border-[#39ff14] focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Prominent Access Code for Immediate Committee Assignment */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-[#39ff14]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#39ff14] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    كود الترقية / العضوية (Access Code)
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">اختياري</span>
                </div>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="مثال: DELTA-MEMBER-2026 أو HEAD-MARKETING-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono uppercase tracking-wider text-left focus:border-[#39ff14] focus:outline-none"
                  dir="ltr"
                />

                {codeValidation.tested ? (
                  <div className={`text-[11px] font-bold flex items-center gap-1.5 ${codeValidation.valid ? 'text-[#39ff14]' : 'text-rose-400'}`}>
                    {codeValidation.valid ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>كود صالح: سيتم تعيينك في لجنة ({codeValidation.codeObj?.committee.toUpperCase()}) برتبة {codeValidation.codeObj?.position} مباشرة!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{codeValidation.error}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    إذا كان معك كود رسمي، سيتم تفعيل حسابك كـ <span className="text-[#39ff14] font-bold">عضو معتمد</span> في لجنته فوراً.
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isSubmitting ? 'جاري المعالجة...' : mode === 'login' ? 'تسجيل الدخول والترقية 🚀' : 'إنشاء الحساب والانضمام 🛸'}
          </button>
        </form>

      </div>
    </div>
  );
};
