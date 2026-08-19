import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  MessageCircle, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Clock, 
  Ticket,
  Send,
  Download,
  Plus,
  Upload,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { EventItem, EventRegistration } from '../../types';
import { AppStore } from '../../lib/store';
import { cleanPhoneNumber } from '../../lib/whatsapp';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { isLeaderOrHead, isTeamLeadership } from '../../lib/permissions';
import confetti from 'canvas-confetti';

interface EventsViewProps {
  events: EventItem[];
}

export const EventsView: React.FC<EventsViewProps> = ({ events }) => {
  const { currentProfile } = useAuth();
  const { t, language, isRtl } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration Modal State
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regFacultyLevel, setRegFacultyLevel] = useState('1');
  const [regStudentId, setRegStudentId] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  // Add Event Modal State for Leaders / Board
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('كلية الصيدلة — مدرج الاحتفالات');
  const [newCategory, setNewCategory] = useState<'job_fair' | 'academic' | 'workshop' | 'cultural' | 'community'>('job_fair');
  const [newSpeaker, setNewSpeaker] = useState('');
  const [newWaGroup, setNewWaGroup] = useState('');
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageEvents = currentProfile && (
    isLeaderOrHead(currentProfile.role) ||
    isTeamLeadership(currentProfile.role) ||
    currentProfile.role === 'head' ||
    currentProfile.role === 'sub_head' ||
    currentProfile.role === 'og' ||
    currentProfile.role === 'team_head'
  );

  const categories = [
    { id: 'all', label: language === 'ar' ? 'جميع الفعاليات' : 'All Events' },
    { id: 'job_fair', label: language === 'ar' ? 'معارض التوظيف (Job Fair)' : 'Job Fairs' },
    { id: 'academic', label: language === 'ar' ? 'المؤتمرات الأكاديمية' : 'Conferences' },
    { id: 'workshop', label: language === 'ar' ? 'ورش العمل المتخصصة' : 'Workshops' },
    { id: 'cultural', label: language === 'ar' ? 'الندوات الثقافية' : 'Cultural' },
    { id: 'community', label: language === 'ar' ? 'الأنشطة المجتمعية' : 'Community' },
  ];

  const handleDownloadPoster = (imageUrl: string, eventTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `Aliens-Event-${eventTitle.replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEventImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        alert(language === 'ar' ? 'حجم الصورة كبير، يرجى اختيار ملف أقل من 6 ميجابايت' : 'Image is too large (max 6MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setNewImagePreview(res);
        setNewImageUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImg = newImagePreview || newImageUrl.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';

    AppStore.createEvent({
      title: newTitle.trim(),
      description: newDesc.trim(),
      date: newDate,
      time: newTime || '10:00 AM',
      location: newLocation.trim(),
      category: newCategory,
      image_url: finalImg,
      speaker: newSpeaker.trim() || undefined,
      whatsapp_group: newWaGroup.trim() || undefined,
      whatsapp_groups: newWaGroup.trim() ? [{ id: 'wa-1', title: 'جروب الواتساب الرسمي للفعالية', link: newWaGroup.trim() }] : [],
      registration_count: 0
    });

    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setNewTime('');
    setNewImagePreview(null);
    setNewImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAddEventOpen(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (e.speaker && e.speaker.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenRegistration = (event: EventItem) => {
    setRegisteringEvent(event);
    setRegSuccess(false);
    setRegError('');
    if (currentProfile) {
      setRegFullName(currentProfile.full_name || '');
      setRegEmail(currentProfile.email || '');
      setRegPhone(currentProfile.phone || '');
      setRegFacultyLevel(currentProfile.faculty_level ? String(currentProfile.faculty_level) : '1');
      setRegStudentId(currentProfile.student_id || '');
    } else {
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegStudentId('');
    }
    setRegNotes('');
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError(language === 'ar' ? 'يرجى إكمال جميع الحقول الإلزامية.' : 'Please fill all required fields.');
      return;
    }

    const regData: Omit<EventRegistration, 'id' | 'registered_at' | 'status' | 'ticket_code'> = {
      event_id: registeringEvent.id,
      event_title: registeringEvent.title,
      user_id: currentProfile ? currentProfile.id : undefined,
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      phone: cleanPhoneNumber(regPhone),
      faculty_level: String(regFacultyLevel || '1'),
      student_id: regStudentId.trim() || undefined,
      notes: regNotes.trim() || undefined
    };

    AppStore.registerForEvent(regData);
    setRegSuccess(true);
    confetti({ particleCount: 80, spread: 70 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header with Search and Add Event Button */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/25 text-xs font-black">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('events_badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t('events_title')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('events_sub')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {canManageEvents && (
            <button
              onClick={() => setAddEventOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة فعالية جديدة ورفع بوستر 🎟️' : 'Add Event & Poster 🎟️'}</span>
            </button>
          )}

          {/* Search bar */}
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('events_search_placeholder')}
              className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-2xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#39ff14]/60 transition-all shadow-inner`}
            />
            <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#39ff14] text-slate-950 font-black shadow-md shadow-[#39ff14]/20'
                : 'glass-panel text-slate-300 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          return (
            <div 
              key={event.id}
              className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-[#39ff14]/30 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Event Image & Poster */}
                {event.image_url && (
                  <div className="relative h-56 sm:h-64 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] font-black text-[#39ff14] flex items-center gap-1.5 shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        {event.category.toUpperCase()}
                      </span>
                    </div>

                    {/* Download Poster Button */}
                    <button
                      onClick={(e) => handleDownloadPoster(event.image_url, event.title, e)}
                      className="absolute top-4 left-4 p-2 rounded-xl bg-slate-950/80 hover:bg-black backdrop-blur-md border border-white/15 text-white hover:text-[#39ff14] transition-all shadow-lg flex items-center gap-1 text-[10px] font-black cursor-pointer"
                      title="تحميل بوستر الفعالية"
                    >
                      <Download className="w-3.5 h-3.5 text-[#39ff14]" />
                      <span className="hidden sm:inline">تحميل البوستر</span>
                    </button>

                    <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-1.5 font-bold bg-slate-950/70 px-3 py-1 rounded-xl backdrop-blur-md">
                        <Calendar className="w-3.5 h-3.5 text-[#39ff14]" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold bg-slate-950/70 px-3 py-1 rounded-xl backdrop-blur-md truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Event Body */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {event.description}
                  </p>

                  {/* WhatsApp Security Notice */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                    <div className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-slate-950" />
                      <span>{language === 'ar' ? 'جروب الواتساب الخاص بالفعالية' : 'Official Event WhatsApp Group'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {language === 'ar'
                        ? '🔒 رابط الانضمام لجروب الواتساب محمي ويظهر لك تلقائياً بمجرد إتمام تسجيل حضورك.'
                        : '🔒 WhatsApp group access is secured and unlocks immediately after completing your registration.'}
                    </p>
                  </div>

                  {/* Speaker & Meta */}
                  {event.speaker && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="font-bold text-white">{t('events_speaker')}</span>
                      <span>{event.speaker}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                <div className="text-xs text-slate-400 font-medium">
                  {event.registration_count || 0} {t('events_registered_count')}
                </div>

                <button
                  onClick={() => handleOpenRegistration(event)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-md shadow-[#39ff14]/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{t('events_register_btn')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚀 MODAL 1: REGISTRATION MODAL */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-6">
            <button
              onClick={() => setRegisteringEvent(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#39ff14] uppercase tracking-widest">Aliens Events Roster</span>
              <h2 className="text-xl font-black text-white">{t('events_register_title')}</h2>
              <p className="text-xs text-slate-400">{registeringEvent.title}</p>
            </div>

            {regSuccess ? (
              <div className="p-6 rounded-3xl bg-emerald-950/90 border border-emerald-500/60 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-[#39ff14]/20 border border-[#39ff14] flex items-center justify-center mx-auto shadow-lg shadow-[#39ff14]/20">
                  <CheckCircle2 className="w-9 h-9 text-[#39ff14]" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">
                    {language === 'ar' ? 'تم تأكيد تسجيل حضورك بنجاح! 🎉' : 'Registration Confirmed! 🎉'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {language === 'ar' 
                      ? 'تم تسجيل بياناتك بنجاح في كشف الحضور المعتمد. اضغط أدناه للانضمام الفوري لجروب الواتساب الرسمي لمتابعة التعليمات وجدول الفعالية:'
                      : 'You are verified in the official attendees roster. Join the official WhatsApp group below to receive event instructions:'}
                  </p>
                </div>

                {/* Unlocked WhatsApp Groups Section */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-black text-[#25D366] flex items-center justify-center gap-1.5">
                    <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                    <span>{language === 'ar' ? 'جروبات الواتساب المتاحة للفعالية (اضغط للانضمام):' : 'Event WhatsApp Groups (Click to Join):'}</span>
                  </div>

                  <div className="space-y-2">
                    {((registeringEvent.whatsapp_groups && registeringEvent.whatsapp_groups.length > 0)
                      ? registeringEvent.whatsapp_groups
                      : registeringEvent.whatsapp_group
                        ? [{ id: 'wa-1', title: language === 'ar' ? 'جروب الواتساب الرسمي للفعالية' : 'Official Event WhatsApp Group', link: registeringEvent.whatsapp_group }]
                        : [{ id: 'wa-def', title: language === 'ar' ? 'جروب الواتساب الرسمي للفعالية' : 'Official WhatsApp Group', link: 'https://chat.whatsapp.com' }]
                    ).map((g, idx) => (
                      <a
                        key={g.id || idx}
                        href={g.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-2xl bg-[#25D366] text-slate-950 font-black text-xs flex items-center justify-between hover:brightness-110 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer group/wa"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 fill-slate-950" />
                          <span>{g.title || (language === 'ar' ? `جروب واتساب ${idx + 1}` : `WhatsApp Group ${idx + 1}`)}</span>
                        </div>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-black">
                          {language === 'ar' ? 'انضم الآن 🚀' : 'Join Now 🚀'}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setRegisteringEvent(null)}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs cursor-pointer transition-all"
                  >
                    {t('gallery_close')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRegistration} className="space-y-4 text-right">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">{t('events_modal_fullname')}</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="مثال: د. أحمد محمد العوضي"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">{t('events_modal_email')}</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@deltauniv.edu.eg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">{t('events_modal_phone')}</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">{t('events_modal_faculty_level')}</label>
                    <select
                      value={regFacultyLevel}
                      onChange={(e) => setRegFacultyLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                    >
                      <option value="1">الفرقة الأولى (First Year)</option>
                      <option value="2">الفرقة الثانية (Second Year)</option>
                      <option value="3">الفرقة الثالثة (Third Year)</option>
                      <option value="4">الفرقة الرابعة (Fourth Year)</option>
                      <option value="5">الفرقة الخامسة / التخرج (Fifth Year)</option>
                      <option value="6">طبيب صيدلي / خريج (Graduate)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">{t('events_modal_student_id')}</label>
                    <input
                      type="text"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="مثال: 20220415"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('events_modal_submit')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🎟️ MODAL 2: ADD EVENT & UPLOAD POSTER (LEADERSHIP) */}
      {addEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-5">
            <button
              onClick={() => setAddEventOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30 text-xs font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>صلاحية إدارة الفعاليات والبوسترات</span>
              </div>
              <h2 className="text-xl font-black text-white">إضافة فعالية جديدة ورفع البوستر</h2>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">عنوان الفعالية</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: Pharma Career Summit 2026..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">التصنيف</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  >
                    <option value="job_fair">معارض التوظيف (Job Fair)</option>
                    <option value="academic">المؤتمرات الأكاديمية</option>
                    <option value="workshop">ورش العمل</option>
                    <option value="cultural">الندوات الثقافية</option>
                    <option value="community">الأنشطة المجتمعية</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المكان</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="مدرج الاحتفالات - كلية الصيدلة"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المتحدث الرئيسي (إن وجد)</label>
                  <input
                    type="text"
                    value={newSpeaker}
                    onChange={(e) => setNewSpeaker(e.target.value)}
                    placeholder="د. أحمد الصاوي - مدير الجودة"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">رابط جروب واتساب الفعالية (محمي ويظهر بعد التسجيل)</label>
                <input
                  type="url"
                  value={newWaGroup}
                  onChange={(e) => setNewWaGroup(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
                  dir="ltr"
                />
              </div>

              {/* Poster Upload / File Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">بوستر / صورة الفعالية</label>
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleEventImageFile}
                    accept="image/*"
                    className="hidden"
                    id="event-poster-file-input"
                  />
                  <label
                    htmlFor="event-poster-file-input"
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:border-[#39ff14]/40"
                  >
                    <Upload className="w-4 h-4 text-[#39ff14]" />
                    <span>رفع بوستر من جهازك</span>
                  </label>

                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      if (e.target.value.startsWith('http')) setNewImagePreview(e.target.value);
                    }}
                    placeholder="أو رابط البوستر المباشر..."
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                {newImagePreview && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 max-h-48 bg-slate-950 mt-2">
                    <img src={newImagePreview} alt="Poster preview" className="max-h-48 w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setNewImagePreview(null); setNewImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">وصف الفعالية</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="اكتب تفاصيل المحاور والشهادات وفرص التدريب المتاحة..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>نشر الفعالية وحفظ البوستر 🚀</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
