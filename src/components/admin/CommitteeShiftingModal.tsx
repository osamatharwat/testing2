import React, { useState } from 'react';
import { CommitteeEntity, Application, Profile } from '../../types';
import { AppStore } from '../../lib/store';
import { 
  X, 
  ArrowRightLeft, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  AlertCircle, 
  ShieldCheck 
} from 'lucide-react';

interface CommitteeShiftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application;
  member?: Profile;
  currentUser: Profile;
  onSuccess?: () => void;
}

export const CommitteeShiftingModal: React.FC<CommitteeShiftingModalProps> = ({
  isOpen,
  onClose,
  application,
  member,
  currentUser,
  onSuccess
}) => {
  const committees = AppStore.getCommittees();
  const currentCommKey = application ? application.committee_key : member?.committee;

  const [targetCommitteeKey, setTargetCommitteeKey] = useState<string>(
    committees.find(c => c.key !== currentCommKey)?.key || 'marketing'
  );
  const [newPosition, setNewPosition] = useState<string>(
    application ? application.role_requested || 'Active Member' : member?.position || 'Active Member'
  );
  const [reasonNotes, setReasonNotes] = useState<string>('توصية لجنة المقابلات بنقل المرشح لتناسب مهاراته أكثر مع اللجنة الجديدة.');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleShift = () => {
    setErrorMsg('');
    const targetCommObj = committees.find(c => c.key === targetCommitteeKey);
    const targetCommName = targetCommObj ? targetCommObj.name_ar : targetCommitteeKey;

    try {
      if (application) {
        AppStore.shiftApplicationCommittee(
          application.id,
          targetCommitteeKey,
          targetCommName,
          currentUser
        );
        setSuccessMsg(`تم نقل طلب (${application.applicant_name}) بنجاح إلى لجنة (${targetCommName})!`);
      } else if (member) {
        AppStore.shiftMemberCommittee(
          member.id,
          targetCommitteeKey,
          newPosition,
          currentUser
        );
        setSuccessMsg(`تم نقل وتحديث لجنة العضو (${member.full_name}) إلى (${targetCommName})!`);
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء نقل اللجنة');
    }
  };

  const personName = application ? application.applicant_name : member?.full_name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-black">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            إعادة توجيه ونقل اللجنة • Committee Shifting
          </div>
          <h2 className="text-xl font-black text-white">نقل اللجنة بعد المقابلة 🔄</h2>
          <p className="text-xs text-slate-400">
            الاسم: <span className="text-white font-bold">{personName}</span> (اللجنة الحالية: <span className="text-amber-300 font-bold">{application?.committee_name || member?.committee}</span>)
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#39ff14] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">اللجنة الجديدة المراد النقل إليها:</label>
            <select
              value={targetCommitteeKey}
              onChange={(e) => setTargetCommitteeKey(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:border-[#39ff14] focus:outline-none"
            >
              {committees.map((comm) => (
                <option key={comm.key} value={comm.key}>
                  {comm.name_ar} ({comm.name}) {comm.capacity_limit ? `• السعة: ${comm.capacity_limit}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">المسمى / المنصب المقترح:</label>
            <input
              type="text"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="مثال: Content Creator أو PR Specialist"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">ملاحظات وسبب النقل:</label>
            <textarea
              value={reasonNotes}
              onChange={(e) => setReasonNotes(e.target.value)}
              rows={3}
              placeholder="اكتب أسباب النقل وتوصية المقابلة..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleShift}
            className="flex-1 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>تأكيد نقل اللجنة فوراً</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
};
