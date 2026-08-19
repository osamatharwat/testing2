import React, { useRef } from 'react';
import { EventItem, EventRegistration } from '../../types';
import { 
  X, 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Download, 
  Printer, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface EventTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  registration: EventRegistration;
}

export const EventTicketModal: React.FC<EventTicketModalProps> = ({
  isOpen,
  onClose,
  event,
  registration
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-md glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
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
            <Ticket className="w-3.5 h-3.5" />
            التذكرة الإلكترونية الرسمية • Aliens Pass
          </div>
          <h2 className="text-xl font-black text-white">تذكرة دخول الفعالية 🎟️</h2>
          <p className="text-xs text-slate-400">يرجى إبراز رمز الـ QR Code عند بوابة الدخول للتحقق الفوري</p>
        </div>

        {/* Printable Ticket Card */}
        <div 
          ref={ticketRef} 
          className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-[#39ff14]/40 p-6 shadow-2xl space-y-5"
        >
          {/* Neon Glow accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Notch Brand */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👽</span>
              <div>
                <h3 className="text-sm font-black text-white">Aliens Student Activity</h3>
                <p className="text-[10px] text-slate-400 font-mono">Faculty of Pharmacy • Delta Univ.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#39ff14]/20 border border-[#39ff14]/40 text-[#39ff14] text-[11px] font-mono font-black">
              {registration.ticket_tier || (event.is_paid ? 'PAID PASS' : 'FREE PASS')}
            </span>
          </div>

          {/* Event Title */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">اسم الفعالية / Event</span>
            <h4 className="text-base font-black text-white leading-snug">{event.title}</h4>
          </div>

          {/* Attendee Details */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">اسم الحاضر:</span>
              <span className="text-white font-black">{registration.full_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">الفرقة الدراسية:</span>
              <span className="text-cyan-300 font-bold">Level {registration.faculty_level || '1'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">التاريخ:</span>
              <span className="text-slate-300 font-medium">{event.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">المكان:</span>
              <span className="text-slate-300 font-medium truncate block">{event.location}</span>
            </div>
          </div>

          {/* Ticket QR Section */}
          <div className="p-4 rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-center space-y-2 shadow-inner text-center">
            {/* Visual QR Simulator */}
            <div className="w-36 h-36 border-4 border-slate-950 p-2 rounded-xl bg-white flex flex-col items-center justify-center relative">
              <QrCode className="w-28 h-28 text-slate-950" />
              <span className="absolute inset-0 flex items-center justify-center opacity-15 text-2xl font-black font-mono">
                ALIENS
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-black tracking-widest text-slate-900 block">
                {registration.ticket_code}
              </span>
              <span className="text-[10px] text-slate-600 font-bold">
                كود تصريح الدخول الإلكتروني
              </span>
            </div>
          </div>

          {/* Footer Watermark */}
          <div className="text-center pt-1 border-t border-dashed border-white/15">
            <p className="text-[10px] text-slate-400 font-mono">
              Issued via Aliens Space OS • Official Verification Seal
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ التذكرة PDF</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
