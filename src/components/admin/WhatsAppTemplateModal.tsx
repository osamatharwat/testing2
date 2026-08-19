import React, { useState, useEffect } from 'react';
import { WhatsAppTemplate, Profile, Application } from '../../types';
import { AppStore } from '../../lib/store';
import { formatWhatsAppUrl } from '../../lib/whatsapp';
import { 
  X, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPhone: string;
  targetName: string;
  committeeName?: string;
  roleRequested?: string;
  application?: Application;
  member?: Profile;
}

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  isOpen,
  onClose,
  targetPhone,
  targetName,
  committeeName = 'Aliens',
  roleRequested = 'Active Member',
  application,
  member
}) => {
  const settings = AppStore.getSettings();
  const templates: WhatsAppTemplate[] = settings.whatsapp_templates || [];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.length > 0 ? templates[0].id : 'tpl-interview'
  );

  const [dateTime, setDateTime] = useState<string>('غداً الساعة 3:00 عصراً');
  const [location, setLocation] = useState<string>('مقر كلية الصيدلة — مبنى B قاعة 204');
  const [deadline, setDeadline] = useState<string>('الخميس القادم الساعة 10:00 مساءً');
  const [irName, setIrName] = useState<string>('مسؤول المتابعة بالـ IR');
  const [customMessage, setCustomMessage] = useState<string>('');

  useEffect(() => {
    const activeUserId = AppStore.getActiveUserId();
    const activeUser = AppStore.getProfileById(activeUserId);
    if (activeUser) {
      setIrName(activeUser.full_name);
    }
  }, []);

  // Update generated text whenever selection or parameters change
  useEffect(() => {
    const tpl = templates.find(t => t.id === selectedTemplateId);
    if (tpl) {
      let text = tpl.message_template;
      text = text.replace(/{applicant_name}/g, targetName);
      text = text.replace(/{member_name}/g, targetName);
      text = text.replace(/{committee_name}/g, committeeName);
      text = text.replace(/{role_requested}/g, roleRequested);
      text = text.replace(/{date_time}/g, dateTime);
      text = text.replace(/{location}/g, location);
      text = text.replace(/{deadline}/g, deadline);
      text = text.replace(/{ir_name}/g, irName);
      setCustomMessage(text);
    }
  }, [selectedTemplateId, targetName, committeeName, roleRequested, dateTime, location, deadline, irName, templates]);

  if (!isOpen) return null;

  const handleSend = () => {
    const waUrl = formatWhatsAppUrl(targetPhone, customMessage);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 text-xs font-black">
            <MessageCircle className="w-3.5 h-3.5" />
            مركز رسائل الواتساب الذكية • WhatsApp Dispatcher
          </div>
          <h2 className="text-xl font-black text-white">إرسال رسالة رسمية للمرشح / العضو 💬</h2>
          <p className="text-xs text-slate-400">
            إلى: <span className="text-white font-bold">{targetName}</span> ({targetPhone})
          </p>
        </div>

        {/* Template Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">اختر قالب الرسالة (Template)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`p-3 rounded-2xl border text-right transition-all text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  selectedTemplateId === tpl.id
                    ? 'bg-[#25D366]/15 border-[#25D366] text-white shadow-md shadow-[#25D366]/10'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <FileText className={`w-4 h-4 shrink-0 ${selectedTemplateId === tpl.id ? 'text-[#25D366]' : 'text-slate-400'}`} />
                <span className="truncate">{tpl.title_ar}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Context Variables Editor for quick tuning */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <span className="text-[11px] font-black text-[#39ff14] uppercase tracking-wider block">
            ⚙️ تخصيص متغيرات الرسالة بسرعة:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold">موعد المقابلة / الحدث</label>
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#25D366] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold">المكان / اللوكيشن</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#25D366] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold">ديدلاين التاسك</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#25D366] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold">اسم مسؤول الـ IR</label>
              <input
                type="text"
                value={irName}
                onChange={(e) => setIrName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#25D366] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Message Preview & Direct Edit */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">معاينة النص النهائي (يمكنك التعديل اليدوي قبل الإرسال):</label>
            <span className="text-[10px] text-slate-400 font-mono">{customMessage.length} حرف</span>
          </div>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={6}
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-white/15 text-white text-xs sm:text-sm focus:border-[#25D366] focus:outline-none leading-relaxed font-sans"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSend}
            className="flex-1 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إرسال عبر تطبيق واتساب فوراً 🚀</span>
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
