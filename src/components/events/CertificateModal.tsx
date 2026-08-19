import React, { useState, useRef } from 'react';
import { EventItem, Profile } from '../../types';
import { AppStore } from '../../lib/store';
import { 
  X, 
  Award, 
  Download, 
  Upload, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Image as ImageIcon,
  QrCode
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  recipientName?: string;
  recipientProfile?: Profile | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  event,
  recipientName = 'د. اسم المشارك',
  recipientProfile
}) => {
  const [name, setName] = useState(recipientProfile?.full_name || recipientName);
  const [customTemplateUrl, setCustomTemplateUrl] = useState<string>(
    event.certificate_template_url || 
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80'
  );
  const [verificationCode, setVerificationCode] = useState<string>(
    'CERT-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-2026'
  );

  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomTemplateUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 text-xs font-black">
            <Award className="w-3.5 h-3.5" />
            مولد الشهادات الرسمية المعتمدة • Aliens Certificates
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">شهادة الحضور والاجتياز 📜✨</h2>
          <p className="text-xs text-slate-400">
            يمكنك تخصيص اسم المشارك أو رفع تصميم شهادة مخصص بصيغة صورة / فوتوشوب (JPG / PNG)
          </p>
        </div>

        {/* Customization Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">اسم صاحب الشهادة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
              placeholder="اكتب الاسم كما سيظهر بالشهادة..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">رفع تصميم قالب مخصص (فوتوشوب / PNG)</label>
            <label className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-slate-300 text-xs font-bold cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-[#39ff14]" />
              <span>اختر صورة القالب من جهازك</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Live Certificate Canvas */}
        <div 
          ref={certRef}
          className="relative w-full aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/40 p-8 sm:p-12 flex flex-col justify-between text-center select-none"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.82), rgba(10, 15, 29, 0.88)), url(${customTemplateUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Certificate Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
              <div className="text-right">
                <span className="text-[11px] font-mono text-amber-300 font-bold block">FACULTY OF PHARMACY</span>
                <span className="text-[10px] text-slate-400">DELTA UNIVERSITY FOR SCIENCE & TECH</span>
              </div>
              <div className="text-3xl">👽</div>
              <div className="text-left">
                <span className="text-[11px] font-mono text-[#39ff14] font-bold block">ALIENS STUDENT ACTIVITY</span>
                <span className="text-[10px] text-slate-400">OFFICIAL CERTIFICATE</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-300 font-mono font-bold block">
                CERTIFICATE OF ATTENDANCE & ACHIEVEMENT
              </span>
              <h3 className="text-lg sm:text-2xl font-serif font-black text-white">شهادة إتمام ومشاركة معتمدة</h3>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="space-y-3 my-auto py-2">
            <p className="text-xs sm:text-sm text-slate-300">
              تشهد إدارة نشاط Aliens Student Activity بكلية الصيدلة — جامعة الدلتا بأن الدكتور/ة:
            </p>
            
            <div className="py-1">
              <span className="text-xl sm:text-3xl font-black text-[#39ff14] font-serif border-b-2 border-dashed border-[#39ff14]/50 pb-1 px-6 inline-block drop-shadow-md">
                {name || 'اسم المشارك'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              قد شارك/ت بنجاح وتفوق في فعاليات: <span className="text-amber-300 font-bold">"{event.title}"</span> المنعقدة بتاريخ {event.date} بمقر الجامعة.
            </p>
          </div>

          {/* Certificate Footer with Signatures & QR Seal */}
          <div className="flex items-end justify-between border-t border-amber-400/30 pt-4">
            <div className="text-right space-y-0.5">
              <span className="text-xs font-serif font-bold text-white block">Dr. Osama Sarwat</span>
              <span className="text-[10px] text-slate-400 block">OG & Founder</span>
            </div>

            {/* QR Verification Seal */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                <QrCode className="w-10 h-10 text-slate-950" />
              </div>
              <span className="text-[8px] font-mono text-amber-300 font-bold">{verificationCode}</span>
            </div>

            <div className="text-left space-y-0.5">
              <span className="text-xs font-serif font-bold text-white block">Aliens High Board</span>
              <span className="text-[10px] text-slate-400 block">Delta Pharmacy 2026</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>طباعة / تحميل الشهادة المعتمدة PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
