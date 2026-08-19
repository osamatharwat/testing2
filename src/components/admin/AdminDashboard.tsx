import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppStore } from '../../lib/store';
import { 
  Profile, 
  Role, 
  CommitteeKey, 
  Application, 
  PerformanceEvaluation, 
  AccessCode, 
  EventItem, 
  GalleryItem,
  DynamicQuestion,
  QuestionCategory,
  EventRegistration,
  CommitteeEntity,
  DecisionChoice,
  MemberWarning,
  EvaluationCriterion,
  WhatsAppTemplate
} from '../../types';
import { 
  canAssignIRMembers, 
  canEvaluateMember, 
  isIRLeadership, 
  isIREvaluator,
  isLeaderOrHead, 
  isTeamLeadership, 
  isOG, 
  canContactMemberWhatsApp,
  canViewMemberPhone,
  canManageEvent,
  canReviewApplication,
  canManageQuestions,
  getEvaluatableMembers,
  canAccessDataAnalytics,
  canAccessRecruitmentReview,
  canAccessOGCMS
} from '../../lib/permissions';
import { formatWhatsAppUrl, cleanPhoneNumber } from '../../lib/whatsapp';
import { calculateMemberTier, TIERS } from '../../lib/gamification';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  pushAllDataToSupabase, 
  pullAllDataFromSupabase, 
  getSupabaseSQLSchema 
} from '../../lib/supabase';
import { 
  Users, 
  ShieldCheck, 
  Award, 
  UserCheck, 
  KeyRound, 
  Calendar, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  History, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Edit3, 
  Copy, 
  Sparkles, 
  MessageCircle,
  HelpCircle,
  Settings,
  Database,
  ExternalLink,
  Lock,
  Layers,
  ChevronDown,
  UserPlus,
  BarChart3,
  Clock,
  Menu,
  X,
  LayoutDashboard,
  Save,
  Upload,
  Download,
  Eye,
  Check,
  FileText,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Zap,
  FolderOpen,
  Filter,
  CheckSquare,
  TrendingUp,
  Globe,
  Sliders,
  ChevronRight,
  Code,
  ArrowRightLeft,
  Ticket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DataAnalyticsHub } from './DataAnalyticsHub';
import { PublicProfileModal } from '../portal/PublicProfileModal';
import { WhatsAppTemplateModal } from './WhatsAppTemplateModal';
import { CommitteeShiftingModal } from './CommitteeShiftingModal';
import { EventTicketModal } from '../events/EventTicketModal';
import { CertificateModal } from '../events/CertificateModal';

export const AdminDashboard: React.FC = () => {
  const { currentProfile, allProfiles, switchProfile, refreshProfiles } = useAuth();
  const { language, t, isRtl } = useLanguage();
  
  // AppStore data states
  const [applications, setApplications] = useState(() => AppStore.getApplications());
  const [evaluations, setEvaluations] = useState(() => AppStore.getEvaluations());
  const [accessCodes, setAccessCodes] = useState(() => AppStore.getAccessCodes());
  const [events, setEvents] = useState(() => AppStore.getEvents());
  const [gallery, setGallery] = useState(() => AppStore.getGallery());
  const [auditLogs, setAuditLogs] = useState(() => AppStore.getAuditLogs());
  const [allQuestions, setAllQuestions] = useState(() => AppStore.getDynamicQuestions());
  const [allRegistrations, setAllRegistrations] = useState(() => AppStore.getEventRegistrations());
  const [committeesList, setCommitteesList] = useState(() => AppStore.getCommittees());
  const [warningsList, setWarningsList] = useState(() => AppStore.getMemberWarnings());

  // Modal States for Extended Automation
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    isOpen: boolean;
    phone: string;
    name: string;
    committeeName?: string;
    roleRequested?: string;
    application?: Application;
    member?: Profile;
  }>({ isOpen: false, phone: '', name: '' });

  const [shiftingModalData, setShiftingModalData] = useState<{
    isOpen: boolean;
    application?: Application;
    member?: Profile;
  }>({ isOpen: false });

  const [ticketModalData, setTicketModalData] = useState<{
    isOpen: boolean;
    event?: EventItem;
    registration?: EventRegistration;
  }>({ isOpen: false });

  const [certificateModalData, setCertificateModalData] = useState<{
    isOpen: boolean;
    event?: EventItem;
    recipientName?: string;
    recipientProfile?: Profile | null;
  }>({ isOpen: false });

  const refreshAllData = () => {
    setApplications(AppStore.getApplications());
    setEvaluations(AppStore.getEvaluations());
    setAccessCodes(AppStore.getAccessCodes());
    setEvents(AppStore.getEvents());
    setGallery(AppStore.getGallery());
    setAuditLogs(AppStore.getAuditLogs());
    setAllQuestions(AppStore.getDynamicQuestions());
    setAllRegistrations(AppStore.getEventRegistrations());
    setCommitteesList(AppStore.getCommittees());
    setWarningsList(AppStore.getMemberWarnings());
    refreshProfiles();
  };

  useEffect(() => {
    const handleStoreChange = () => {
      refreshAllData();
    };
    window.addEventListener('aliens_store_change', handleStoreChange);
    window.addEventListener('storage', handleStoreChange);
    return () => {
      window.removeEventListener('aliens_store_change', handleStoreChange);
      window.removeEventListener('storage', handleStoreChange);
    };
  }, []);
  
  // Navigation State
  const isIRMemberOnly = currentProfile?.role === 'ir' && !isIRLeadership(currentProfile);
  const [activeTab, setActiveTab] = useState<string>(isIRMemberOnly ? 'evals' : 'overview');
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilterCommittee, setMemberFilterCommittee] = useState('all');
  const [memberFilterRole, setMemberFilterRole] = useState('all');
  const [inspectingProfile, setInspectingProfile] = useState<Profile | null>(null);

  // Recruitment filters
  const [recruitmentFilterCommittee, setRecruitmentFilterCommittee] = useState<string>('all');
  const [recruitmentFilterStatus, setRecruitmentFilterStatus] = useState<string>('all');

  // Feedback states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 4500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // -------------------------------------------------------------
  // 🎟️ EVENTS MANAGEMENT STATE & ACTIONS
  // -------------------------------------------------------------
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('كلية الصيدلة — مدرج الاحتفالات');
  const [eventCategory, setEventCategory] = useState<'job_fair' | 'academic' | 'workshop' | 'cultural' | 'community'>('job_fair');
  const [eventSpeaker, setEventSpeaker] = useState('');
  const [eventWaGroup, setEventWaGroup] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [viewingRegistrationsEvent, setViewingRegistrationsEvent] = useState<EventItem | null>(null);
  const eventPosterInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddEvent = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventDesc('');
    setEventDate('');
    setEventTime('');
    setEventLocation('كلية الصيدلة — مدرج الاحتفالات');
    setEventCategory('job_fair');
    setEventSpeaker('');
    setEventWaGroup('');
    setEventImageUrl('');
    setEventImagePreview(null);
    if (eventPosterInputRef.current) eventPosterInputRef.current.value = '';
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title);
    setEventDesc(ev.description);
    setEventDate(ev.date);
    setEventTime(ev.time || '10:00 AM');
    setEventLocation(ev.location);
    setEventCategory(ev.category as any);
    setEventSpeaker(ev.speaker || '');
    setEventWaGroup(ev.whatsapp_groups?.[0]?.link || ev.whatsapp_group || '');
    setEventImageUrl(ev.image_url || '');
    setEventImagePreview(ev.image_url || null);
    setEventModalOpen(true);
  };

  const handleEventPosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        showError('حجم البوستر كبير، يرجى اختيار ملف أقل من 6 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setEventImagePreview(res);
        setEventImageUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImg = eventImagePreview || eventImageUrl.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';

    if (editingEventId) {
      // Update
      const evList = AppStore.getEvents();
      const idx = evList.findIndex(e => e.id === editingEventId);
      if (idx >= 0) {
        evList[idx] = {
          ...evList[idx],
          title: eventTitle.trim(),
          description: eventDesc.trim(),
          date: eventDate,
          time: eventTime || '10:00 AM',
          location: eventLocation.trim(),
          category: eventCategory,
          image_url: finalImg,
          speaker: eventSpeaker.trim() || undefined,
          whatsapp_group: eventWaGroup.trim() || undefined,
          whatsapp_groups: eventWaGroup.trim() ? [{ id: 'wa-1', title: 'جروب الواتساب الرسمي', link: eventWaGroup.trim() }] : []
        };
        localStorage.setItem('aliens_events_v5', JSON.stringify(evList));
        showSuccess('تم تحديث بيانات الفعالية والبوستر بنجاح!');
      }
    } else {
      // Create
      AppStore.createEvent({
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        date: eventDate,
        time: eventTime || '10:00 AM',
        location: eventLocation.trim(),
        category: eventCategory,
        image_url: finalImg,
        speaker: eventSpeaker.trim() || undefined,
        whatsapp_group: eventWaGroup.trim() || undefined,
        whatsapp_groups: eventWaGroup.trim() ? [{ id: 'wa-1', title: 'جروب الواتساب الرسمي', link: eventWaGroup.trim() }] : [],
        registration_count: 0
      });
      showSuccess('تم تدشين الفعالية ونشر البوستر في الموقع بنجاح!');
      confetti({ particleCount: 60, spread: 70 });
    }

    setEventModalOpen(false);
    refreshAllData();
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف فعالية "${title}" نهائياً من الموقع؟`)) {
      const evList = AppStore.getEvents().filter(e => e.id !== id);
      localStorage.setItem('aliens_events_v5', JSON.stringify(evList));
      AppStore.logAudit('EVENT_DELETED', title, `Deleted by ${currentProfile?.full_name}`);
      showSuccess(`تم حذف فعالية "${title}" بنجاح.`);
      refreshAllData();
    }
  };

  // -------------------------------------------------------------
  // 📸 GALLERY MANAGEMENT STATE & ACTIONS
  // -------------------------------------------------------------
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [gallerySection, setGallerySection] = useState('مجلس الإدارة والقيادة (Board & Leadership)');
  const [galleryTag, setGalleryTag] = useState('board');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddGallery = () => {
    setGalleryTitle('');
    setGallerySection('مجلس الإدارة والقيادة (Board & Leadership)');
    setGalleryTag('board');
    setGalleryDescription('');
    setGalleryImageUrl('');
    setGalleryImagePreview(null);
    if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    setGalleryModalOpen(true);
  };

  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        showError('حجم الصورة كبير، يرجى اختيار ملف أقل من 6 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setGalleryImagePreview(res);
        setGalleryImageUrl(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = galleryImagePreview || galleryImageUrl.trim();
    if (!finalUrl || !galleryTitle.trim()) {
      showError('يرجى كتابة عنوان الصورة وتحديد ملف أو رابط الصورة.');
      return;
    }

    AppStore.createGalleryItem({
      title: galleryTitle.trim(),
      description: galleryDescription.trim() || undefined,
      caption: galleryDescription.trim() || galleryTitle.trim(),
      image_url: finalUrl,
      tag: galleryTag.trim() || 'Aliens',
      section_name: gallerySection,
      created_by: currentProfile?.full_name || 'Leadership'
    });

    setGalleryModalOpen(false);
    showSuccess('تمت إضافة ونشر الصورة في المعرض الرسمي بنجاح!');
    confetti({ particleCount: 50, spread: 60 });
    refreshAllData();
  };

  const handleDeleteGalleryItem = (id: string, title?: string) => {
    if (window.confirm(`هل أنت متأكد من حذف هذه الصورة "${title || 'صورة المعرض'}"؟`)) {
      const gList = AppStore.getGallery().filter(g => g.id !== id);
      localStorage.setItem('aliens_gallery_v5', JSON.stringify(gList));
      AppStore.logAudit('GALLERY_IMAGE_DELETED', id, `Deleted by ${currentProfile?.full_name}`);
      showSuccess('تم حذف الصورة من المعرض.');
      refreshAllData();
    }
  };

  // -------------------------------------------------------------
  // 🏢 COMMITTEES MANAGEMENT STATE & ACTIONS
  // -------------------------------------------------------------
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [editingCommKey, setEditingCommKey] = useState<string | null>(null);
  const [commKey, setCommKey] = useState('');
  const [commName, setCommName] = useState('');
  const [commNameAr, setCommNameAr] = useState('');
  const [commTag, setCommTag] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [commTasks, setCommTasks] = useState('');
  const [commHeadId, setCommHeadId] = useState('');
  const [commSubHeadId, setCommSubHeadId] = useState('');

  const handleOpenAddCommittee = () => {
    setEditingCommKey(null);
    setCommKey('');
    setCommName('');
    setCommNameAr('');
    setCommTag('');
    setCommDesc('');
    setCommTasks('تخطيط مهام اللجنة\nمتابعة الأداء الدوري\nالتنسيق مع اللجان الأخرى');
    setCommHeadId('');
    setCommSubHeadId('');
    setCommModalOpen(true);
  };

  const handleOpenEditCommittee = (c: CommitteeEntity) => {
    setEditingCommKey(c.key);
    setCommKey(c.key);
    setCommName(c.name);
    setCommNameAr(c.name_ar);
    setCommTag(c.tag);
    setCommDesc(c.description);
    setCommTasks((c.tasks || []).join('\n'));
    setCommHeadId(c.head_id || '');
    setCommSubHeadId(c.sub_head_id || '');
    setCommModalOpen(true);
  };

  const handleSaveCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    const taskArr = commTasks.split('\n').map(t => t.trim()).filter(Boolean);

    if (editingCommKey) {
      // Update
      AppStore.updateCommittee(editingCommKey, {
        name: commName.trim(),
        name_ar: commNameAr.trim(),
        tag: commTag.trim(),
        description: commDesc.trim(),
        tasks: taskArr,
        head_id: commHeadId || null,
        sub_head_id: commSubHeadId || null
      });
      showSuccess(`تم تحديث بيانات لجنة ${commNameAr} بنجاح!`);
    } else {
      // Create
      const formattedKey = commKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (!formattedKey) {
        showError('يرجى إدخال مفتاح اللجنة بالإنجليزية (Code / Key).');
        return;
      }
      const existing = AppStore.getCommittees().find(c => c.key === formattedKey);
      if (existing) {
        showError('مفتاح اللجنة هذا موجود مسبقاً، يرجى اختيار مفتاح مميز.');
        return;
      }

      AppStore.createCommittee({
        key: formattedKey,
        name: commName.trim(),
        name_ar: commNameAr.trim(),
        tag: commTag.trim() || 'Active Committee',
        description: commDesc.trim(),
        tasks: taskArr,
        head_id: commHeadId || null,
        sub_head_id: commSubHeadId || null
      });
      showSuccess(`تم إنشاء وتدشين لجنة ${commNameAr} بنجاح!`);
      confetti({ particleCount: 60, spread: 70 });
    }

    setCommModalOpen(false);
    refreshAllData();
  };

  const handleDeleteCommittee = (key: string, nameAr: string) => {
    if (['marketing', 'media', 'pr', 'ir'].includes(key)) {
      if (!window.confirm(`تنبيه: لجنة "${nameAr}" هي إحدى اللجان التأسيسية. هل أنت متأكد تماماً من حذفها؟`)) {
        return;
      }
    } else {
      if (!window.confirm(`هل أنت متأكد من حذف لجنة "${nameAr}" (${key}) نهائياً؟`)) {
        return;
      }
    }

    AppStore.deleteCommittee(key);
    showSuccess(`تم حذف لجنة "${nameAr}" من النظام.`);
    refreshAllData();
  };

  // -------------------------------------------------------------
  // ☁️ SUPABASE INTEGRATION STATE & ACTIONS
  // -------------------------------------------------------------
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseConfig().anonKey);
  const [supabaseAutoSync, setSupabaseAutoSync] = useState(() => getSupabaseConfig().autoSync);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState('');
  const [isSyncingPush, setIsSyncingPush] = useState(false);
  const [isSyncingPull, setIsSyncingPull] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);

  const handleTestSupabase = async () => {
    setSupabaseTesting(true);
    setSupabaseStatusMsg('جارٍ فحص الاتصال بمشروع Supabase...');
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
    setSupabaseTesting(false);
    if (res.success) {
      setSupabaseStatus('connected');
      setSupabaseStatusMsg(res.message);
      saveSupabaseConfig({
        url: supabaseUrl.trim(),
        anonKey: supabaseKey.trim(),
        autoSync: supabaseAutoSync
      });
      showSuccess('تم الاتصال بنجاح وتحديث إعدادات Supabase!');
      confetti({ particleCount: 50, spread: 60 });
    } else {
      setSupabaseStatus('error');
      setSupabaseStatusMsg(res.message);
      showError(res.message);
    }
  };

  const handlePushSupabase = async () => {
    setIsSyncingPush(true);
    const res = await pushAllDataToSupabase();
    setIsSyncingPush(false);
    if (res.success) {
      showSuccess(res.details);
      confetti({ particleCount: 70, spread: 80 });
    } else {
      showError(res.details);
    }
  };

  const handlePullSupabase = async () => {
    if (!window.confirm('هل أنت متأكد من استيراد البيانات من السحابة؟ سيتم تحديث الجداول والبيانات المحلية بما هو مسجل في Supabase.')) {
      return;
    }
    setIsSyncingPull(true);
    const res = await pullAllDataFromSupabase();
    setIsSyncingPull(false);
    if (res.success) {
      showSuccess(res.details);
      refreshAllData();
    } else {
      showError(res.details);
    }
  };

  // -------------------------------------------------------------
  // 👥 EVALUATIONS & RECRUITMENT LOGIC
  // -------------------------------------------------------------
  const evaluatableMembersForCurrent = getEvaluatableMembers(currentProfile, allProfiles);

  const [evalMemberSearch, setEvalMemberSearch] = useState('');
  const [evalCommFilter, setEvalCommFilter] = useState('all');
  const [evalModalMember, setEvalModalMember] = useState<Profile | null>(null);
  const [evalAttendance, setEvalAttendance] = useState(18);
  const [evalTasksQuality, setEvalTasksQuality] = useState(18);
  const [evalCommunication, setEvalCommunication] = useState(18);
  const [evalTeamwork, setEvalTeamwork] = useState(18);
  const [evalInitiative, setEvalInitiative] = useState(18);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalMonth, setEvalMonth] = useState('2026-03 (March Evaluation)');

  const calculatedTotalScore = evalAttendance + evalTasksQuality + evalCommunication + evalTeamwork + evalInitiative;

  const applyScorePreset = (pct: number) => {
    const val = Math.round((pct / 100) * 20);
    setEvalAttendance(val);
    setEvalTasksQuality(val);
    setEvalCommunication(val);
    setEvalTeamwork(val);
    setEvalInitiative(val);
  };

  const handleOpenEvaluationModal = (member: Profile) => {
    setEvalModalMember(member);
    setEvalAttendance(18);
    setEvalTasksQuality(18);
    setEvalCommunication(18);
    setEvalTeamwork(18);
    setEvalInitiative(18);
    setEvalNotes('');
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalModalMember || !currentProfile) return;

    try {
      AppStore.submitEvaluation({
        member_id: evalModalMember.id,
        member_name: evalModalMember.full_name,
        member_committee: (evalModalMember.committee || 'marketing') as CommitteeKey,
        evaluator_id: currentProfile.id,
        evaluator_name: currentProfile.full_name,
        evaluator_role: currentProfile.role,
        evaluation_month: evalMonth,
        score: calculatedTotalScore,
        criteria_scores: {
          attendance: evalAttendance,
          participation: evalInitiative,
          tasks_quality: evalTasksQuality,
          teamwork: evalTeamwork,
          communication: evalCommunication
        },
        notes: evalNotes.trim() || 'تقييم شهري معتمد من مسؤول العلاقات والمتابعة.',
        recommendation: calculatedTotalScore >= 85 ? 'عضو متميز ومرشح للتكريم' : 'متابعة الأداء والتطوير'
      });

      setEvalModalMember(null);
      showSuccess(`تم اعتماد تقييم ${evalModalMember.full_name} بدرجة (${calculatedTotalScore}/100) وتحديث رتبته الكونية!`);
      confetti({ particleCount: 60, spread: 60 });
      refreshAllData();
    } catch (err: any) {
      showError(err.message || 'حدث خطأ أثناء حفظ التقييم');
    }
  };

  // Recruitment Applications State & Handlers
  const [recruitmentSearch, setRecruitmentSearch] = useState('');
  const [recruitmentStatusFilter, setRecruitmentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'waiting_for_head' | 'waiting_for_ir' | 'waiting_for_final_decision'>('all');
  const [recruitmentCommFilter, setRecruitmentCommFilter] = useState('all');
  const [expandedAppIds, setExpandedAppIds] = useState<string[]>([]);
  const [decisionNotesMap, setDecisionNotesMap] = useState<Record<string, string>>({});

  const toggleExpandApp = (id: string) => {
    setExpandedAppIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDualDecision = (
    appId: string, 
    decision: DecisionChoice, 
    role: 'ir' | 'head'
  ) => {
    if (!currentProfile) return;
    try {
      const note = decisionNotesMap[appId] || '';
      const result = AppStore.submitApplicationDualDecision(appId, decision, role, currentProfile, note);
      if (result.autoApproved) {
        showSuccess(`تم اعتماد القبول المزدوج للمتقدم ${result.app.applicant_name} وتم ترقيته كعضو نشط في لجنته تلقائياً! 🚀`);
        confetti({ particleCount: 70, spread: 70 });
      } else {
        showSuccess(`تم تسجيل قرار (${role === 'ir' ? 'مسؤول IR' : 'رئيس اللجنة'}) بنجاح!`);
      }
      refreshAllData();
    } catch (err: any) {
      showError(err.message || 'حدث خطأ أثناء تسجيل القرار');
    }
  };

  const handleOverrideDecision = (appId: string, override: 'approved' | 'rejected') => {
    if (!currentProfile) return;
    try {
      const note = decisionNotesMap[appId] || 'اعتماد مباشر بقرار القيادة العليا (OG Override)';
      const app = AppStore.overrideApplicationDecision(appId, override, currentProfile, note);
      if (override === 'approved') {
        showSuccess(`تم اعتماد وتعيين ${app.applicant_name} في لجنته كعضو نشط بقرار استثنائي! 🚀`);
        confetti({ particleCount: 80, spread: 80 });
      } else {
        showSuccess(`تم رفض طلب ${app.applicant_name} بقرار القيادة العليا.`);
      }
      refreshAllData();
    } catch (err: any) {
      showError(err.message || 'حدث خطأ أثناء تنفيذ القرار');
    }
  };

  const handleDeleteApplication = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    AppStore.deleteApplication(id);
    showSuccess('تم حذف الطلب بنجاح');
    refreshAllData();
  };

  const formatWhatsAppUrl = (phone: string, msg: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('01') ? '2' + cleanPhone : cleanPhone.startsWith('20') ? cleanPhone : '20' + cleanPhone;
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
  };

  // -------------------------------------------------------------
  // 🚀 ACCESS CODES MANAGEMENT
  // -------------------------------------------------------------
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeCommittee, setNewCodeCommittee] = useState<CommitteeKey>('marketing');
  const [newCodeRole, setNewCodeRole] = useState<Role>('member');
  const [newCodePosition, setNewCodePosition] = useState<'Member' | 'Sub Head' | 'Head' | 'Board Member' | 'Leader'>('Member');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(50);

  const handleCreateAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;

    AppStore.addAccessCode({
      code: newCodeName.trim().toUpperCase(),
      committee: newCodeCommittee,
      role: newCodeRole,
      position: newCodePosition,
      max_uses: newCodeMaxUses,
      single_use: false,
      is_active: true
    });

    setNewCodeName('');
    showSuccess('تم إصدار كود العضوية بنجاح!');
    refreshAllData();
  };

  // -------------------------------------------------------------
  // 🛠️ CMS & FLEXIBLE SETTINGS SUITE
  // -------------------------------------------------------------
  const siteSettings = AppStore.getSettings();
  const [cmsHeroTitle, setCmsHeroTitle] = useState(siteSettings.hero_headline || 'Aliens Student Activity');
  const [cmsHeroDesc, setCmsHeroDesc] = useState(siteSettings.hero_description || 'منصة كونية متكاملة لتمكين طلاب وخريجي الصيدلة.');
  const [cmsAnnouncement, setCmsAnnouncement] = useState(siteSettings.announcement_banner || '🚀 باب التقديم لطاقم Aliens مفتوح الآن!');
  const [cmsAnnouncementActive, setCmsAnnouncementActive] = useState(siteSettings.announcement_active !== false);
  const [cmsRecruitmentStatus, setCmsRecruitmentStatus] = useState<'open' | 'closed'>(
    siteSettings.recruitment_status === 'closed' || (siteSettings.recruitment_status as string) === 'close' ? 'closed' : 'open'
  );
  const [cmsRecruitmentNotice, setCmsRecruitmentNotice] = useState(siteSettings.recruitment_notice || 'باب الانضمام مفتوح لجميع الفرق الدراسية.');
  const [cmsPrHeadPhone, setCmsPrHeadPhone] = useState(siteSettings.pr_head_phone || '+201067890123');
  const [cmsPrSubPhone, setCmsPrSubPhone] = useState(siteSettings.pr_sub_phone || '+201012345678');
  
  // Dynamic IR limit & Warning rules
  const [cmsIrMaxLimit, setCmsIrMaxLimit] = useState(siteSettings.ir_max_members_limit || 30);
  const [cmsWarningThreshold, setCmsWarningThreshold] = useState(siteSettings.warning_threshold || 60);
  const [cmsWarningMonths, setCmsWarningMonths] = useState(siteSettings.warning_consecutive_months || 3);

  // Dynamic Evaluation Criteria
  const [cmsCriteria, setCmsCriteria] = useState<EvaluationCriterion[]>(() => {
    return siteSettings.evaluation_criteria && siteSettings.evaluation_criteria.length > 0
      ? siteSettings.evaluation_criteria
      : [
          { id: 'crit_att', key: 'attendance', label: 'Attendance & Punctuality', label_ar: 'الحضور والانضباط', max_points: 20, description: 'الالتزام بمواعيد الاجتماعات والفعاليات' },
          { id: 'crit_qual', key: 'tasks_quality', label: 'Task Execution & Delivery', label_ar: 'جودة تنفيذ المهام والتسليم', max_points: 20, description: 'دقة واحترافية المهام المسندة' },
          { id: 'crit_comm', key: 'communication', label: 'Communication & Responsiveness', label_ar: 'التواصل والتفاعل الفعال', max_points: 20, description: 'سرعة الاستجابة على قنوات النشاط' },
          { id: 'crit_team', key: 'teamwork', label: 'Teamwork & Spirit', label_ar: 'العمل الجماعي وروح الفريق', max_points: 20, description: 'مساعدة الزملاء والمشاركة البناءة' },
          { id: 'crit_init', key: 'participation', label: 'Initiative & Creativity', label_ar: 'المبادرة والإبداع بالأنشطة', max_points: 20, description: 'تقديم مقترحات وأفكار تطويرية' }
        ];
  });

  // Dynamic WhatsApp Templates
  const [cmsTemplates, setCmsTemplates] = useState<WhatsAppTemplate[]>(() => {
    return siteSettings.whatsapp_templates && siteSettings.whatsapp_templates.length > 0
      ? siteSettings.whatsapp_templates
      : [
          {
            id: 'tmpl_interview',
            title: 'تحديد موعد المقابلة الشخصية (Interview Call)',
            category: 'interview',
            message: 'مرحباً د. {name} 👋\nنتواصل معك من طاقم Aliens Student Activity بخصوص طلب انضمامك للجنة ({committee}).\n\nيسرنا دعوتك للمقابلة الشخصية (Interview):\n📅 الموعد: {date}\n📍 المكان: {location}\n\nنتمنى لك كل التوفيق!'
          },
          {
            id: 'tmpl_acceptance',
            title: 'تهنئة القبول الرسمي وتفعيل العضوية (Acceptance)',
            category: 'acceptance',
            message: 'أهلاً بك يا بطل في سفينة Aliens! 🚀👽\nمبارك قبولك رسمياً د. {name} ضمن لجنة ({committee}).\nكود تفعيل حسابك هو: {code}\nرابط المنصة: https://aliens-activity.web.app\nنحن فخورون بوجودك معنا!'
          },
          {
            id: 'tmpl_warning',
            title: 'إشعار متابعة أداء وإنذار (Performance Warning)',
            category: 'warning',
            message: 'تحية طيبة د. {name} من إدارة المتابعة ونشاط Aliens.\nنود لفت عنايتك إلى ضرورة رفع وتيرة التفاعل وتسليم المهام في لجنة ({committee}) لتحسين تقييمك الشهري.\nنحن واثقون بقدرتك على العودة للأداء المميز! 💪'
          },
          {
            id: 'tmpl_meeting',
            title: 'دعوة لاجتماع طارئ / دوري للجنة (General Meeting)',
            category: 'meeting',
            message: 'د. {name} طاب يومك،\nتذكير بموعد الاجتماع الهام للجنة ({committee}):\n📅 الموعد: {date}\n📍 المكان: {location}\n\nيرجى تأكيد الحضور في الموعد المحدد.'
          }
        ];
  });

  // Manual warning states
  const [manualWarningMemberId, setManualWarningMemberId] = useState('');
  const [manualWarningReason, setManualWarningReason] = useState('');
  const [manualWarningSeverity, setManualWarningSeverity] = useState<'verbal' | 'written' | 'final_strike'>('written');

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    AppStore.updateSettings({
      hero_headline: cmsHeroTitle.trim(),
      hero_description: cmsHeroDesc.trim(),
      announcement_banner: cmsAnnouncement.trim(),
      announcement_active: cmsAnnouncementActive,
      recruitment_status: cmsRecruitmentStatus,
      recruitment_notice: cmsRecruitmentNotice.trim(),
      pr_head_phone: cmsPrHeadPhone.trim(),
      pr_sub_phone: cmsPrSubPhone.trim(),
      ir_max_members_limit: Number(cmsIrMaxLimit) || 30,
      warning_threshold: Number(cmsWarningThreshold) || 60,
      warning_consecutive_months: Number(cmsWarningMonths) || 3,
      evaluation_criteria: cmsCriteria,
      whatsapp_templates: cmsTemplates
    });
    showSuccess('تم حفظ ونشر كافة إعدادات الموقع ولوائح التقييم وقوالب الواتساب بنجاح! 🚀');
    confetti({ particleCount: 70, spread: 80 });
    refreshAllData();
  };

  const handleAddCriterion = () => {
    const newId = 'crit_' + Date.now();
    const newCrit: EvaluationCriterion = {
      id: newId,
      key: 'custom_metric_' + (cmsCriteria.length + 1),
      label: 'New Metric ' + (cmsCriteria.length + 1),
      label_ar: 'معيار جديد ' + (cmsCriteria.length + 1),
      max_points: 20,
      description: 'وصف المعيار وطريقة احتسابه'
    };
    setCmsCriteria([...cmsCriteria, newCrit]);
  };

  const handleUpdateCriterion = (index: number, updated: Partial<EvaluationCriterion>) => {
    const next = [...cmsCriteria];
    next[index] = { ...next[index], ...updated };
    setCmsCriteria(next);
  };

  const handleRemoveCriterion = (index: number) => {
    if (cmsCriteria.length <= 1) {
      showError('يجب الإبقاء على معيار تقييم واحد على الأقل.');
      return;
    }
    setCmsCriteria(cmsCriteria.filter((_, i) => i !== index));
  };

  const handleAddTemplate = () => {
    const newTmpl: WhatsAppTemplate = {
      id: 'tmpl_' + Date.now(),
      title: 'قالب رسالة مخصص جديد',
      category: 'general',
      message: 'مرحباً د. {name}، نتواصل معك من طاقم Aliens بخصوص {committee}.'
    };
    setCmsTemplates([...cmsTemplates, newTmpl]);
  };

  const handleUpdateTemplate = (index: number, updated: Partial<WhatsAppTemplate>) => {
    const next = [...cmsTemplates];
    next[index] = { ...next[index], ...updated };
    setCmsTemplates(next);
  };

  const handleRemoveTemplate = (index: number) => {
    setCmsTemplates(cmsTemplates.filter((_, i) => i !== index));
  };

  const handleIssueManualWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWarningMemberId || !manualWarningReason.trim() || !currentProfile) {
      showError('يرجى اختيار العضو وكتابة سبب الإنذار.');
      return;
    }
    const targetMem = allProfiles.find(p => p.id === manualWarningMemberId);
    if (!targetMem) return;

    AppStore.issueWarning({
      member_id: targetMem.id,
      member_name: targetMem.full_name,
      member_committee: (targetMem.committee || 'marketing') as CommitteeKey,
      warning_type: manualWarningSeverity,
      reason: manualWarningReason.trim(),
      issued_by_id: currentProfile.id,
      issued_by_name: currentProfile.full_name,
      issued_by_role: currentProfile.role
    });

    setManualWarningReason('');
    showSuccess(`تم إصدار الإنذار الرسمي بحق العضو ${targetMem.full_name} وتسجيله في اللائحة الانضباطية.`);
    refreshAllData();
  };

  const handleResolveWarning = (warningId: string) => {
    AppStore.resolveWarning(warningId);
    showSuccess('تم إلغاء وتسوية الإنذار بنجاح.');
    refreshAllData();
  };

  // Guard Clause for Null Session
  if (!currentProfile) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 glass-panel rounded-3xl border border-white/10 text-center space-y-4">
        <Lock className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-black text-white">يرجى تسجيل الدخول أو اختيار بروفايل العضوية</h2>
        <p className="text-xs text-slate-400">لوحة القيادة الإدارية مخصصة لأعضاء وقادة نشاط Aliens الصيدلي المعتمدين.</p>
      </div>
    );
  }

  const isLeader = isLeaderOrHead(currentProfile?.role);
  const isIRLead = isIRLeadership(currentProfile);

  // Grouped Navigation Structure
  const navigationCategories = [
    {
      group: 'الرئيسية والمؤشرات',
      items: [
        ...(!isIRMemberOnly ? [{ id: 'overview', label: 'نظرة عامة ومؤشرات الأداء', shortLabel: 'نظرة عامة', icon: Sparkles }] : []),
        ...(canAccessDataAnalytics(currentProfile) ? [{ id: 'analytics', label: 'تحليل وتصدير الداتا (Data Hub)', shortLabel: 'تحليل الداتا', icon: BarChart3 }] : []),
        ...(isLeader || isIRLead ? [{ id: 'logs', label: 'سجل العمليات والرقابة (Audit)', shortLabel: 'سجل العمليات', icon: History }] : [])
      ]
    },
    {
      group: 'شؤون الأعضاء والتقييم',
      items: [
        ...(isLeader || isIRLead ? [{ id: 'members', label: `دليل وبحث الأعضاء (${(allProfiles || []).length})`, shortLabel: 'بحث الأعضاء', icon: Users, badge: (allProfiles || []).length }] : []),
        { id: 'evals', label: `التقييم الشهري والرتب (${(evaluatableMembersForCurrent || []).length})`, shortLabel: 'التقييم الشهري', icon: Award, badge: (evaluatableMembersForCurrent || []).length },
        ...(canAssignIRMembers(currentProfile) ? [{ id: 'ir_dist', label: 'توزيع أعضاء المتابعة (IR Distribution)', shortLabel: 'توزيع IR', icon: Layers }] : [])
      ]
    },
    {
      group: 'التعيينات واللجان',
      items: [
        ...(canAccessRecruitmentReview(currentProfile) ? [{ id: 'recruitment', label: `طلبات التعيين والاعتماد (${(applications || []).length})`, shortLabel: 'طلبات التعيين', icon: UserCheck, badge: (applications || []).length }] : []),
        ...(isLeader ? [{ id: 'committees', label: `إدارة اللجان والفرق (${(committeesList || []).length})`, shortLabel: 'إدارة اللجان', icon: FolderOpen, badge: (committeesList || []).length }] : []),
        ...(isLeader || isIRLead ? [{ id: 'questions', label: `بنك أسئلة المقابلات (${(allQuestions || []).length})`, shortLabel: 'بنك الأسئلة', icon: HelpCircle }] : []),
        ...(isLeader ? [{ id: 'codes', label: `أكواد الانضمام (${(accessCodes || []).length})`, shortLabel: 'أكواد العضوية', icon: KeyRound }] : [])
      ]
    },
    {
      group: 'الفعاليات والمعرض',
      items: [
        ...(isLeader ? [{ id: 'events_mgmt', label: `إدارة الفعاليات والبوسترات (${(events || []).length})`, shortLabel: 'الفعاليات والبوسترات', icon: Calendar, badge: (events || []).length }] : []),
        ...(isLeader ? [{ id: 'gallery_mgmt', label: `إدارة معرض الصور والألبومات (${(gallery || []).length})`, shortLabel: 'معرض الصور', icon: ImageIcon, badge: (gallery || []).length }] : [])
      ]
    },
    {
      group: 'السحابة وإعدادات OG',
      items: [
        ...(canAccessOGCMS(currentProfile) ? [{ id: 'supabase_hub', label: 'ربط قاعدة بيانات Supabase', shortLabel: 'سوبابيز السحابية', icon: Cloud }] : []),
        ...(canAccessOGCMS(currentProfile) ? [{ id: 'og_panel', label: 'إدارة محتوى الموقع وOG Master', shortLabel: 'إعدادات الموقع وOG', icon: ShieldCheck }] : [])
      ]
    }
  ];

  // Flattened active tabs for lookup
  const allTabs = navigationCategories.flatMap(g => g.items);
  const currentActiveTabObj = allTabs.find(t => t.id === activeTab) || allTabs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* 🚀 TOP HEADER WITH STATS & PROFILE INFO */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff14]/10 text-[#39ff14] text-xs font-black border border-[#39ff14]/25">
            <ShieldCheck className="w-3.5 h-3.5" />
            Aliens Command Center • {currentProfile.role.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            لوحة القيادة والتحكم الإداري
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {language === 'ar' ? 'القائد المسؤول: ' : 'Active Leader: '} 
            <span className="text-white font-bold">{currentProfile.full_name}</span> 
            {' '}({currentProfile.position} • {currentProfile.committee ? currentProfile.committee.toUpperCase() : 'General Crew'})
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {canAccessOGCMS(currentProfile) && (
            <button
              onClick={() => setActiveTab('supabase_hub')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-black text-emerald-300 flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Cloud className="w-4 h-4 text-[#39ff14]" />
              <span>ربط Supabase</span>
            </button>
          )}

          <button
            onClick={() => AppStore.exportToCSV('aliens_members_data', allProfiles)}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>تصدير الأعضاء CSV</span>
          </button>
        </div>
      </div>

      {/* Global Alerts Feedback */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center gap-2 animate-in fade-in shadow-xl">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#39ff14]" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs font-black flex items-center gap-2 animate-in fade-in shadow-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 🧭 MODERN NAVIGATION BAR & CATEGORY MENU (REPLACING THE STATIC SIDEBAR) */}
      <div className="glass-panel p-3 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 relative z-30">
        
        {/* Dropdown Selector Menu */}
        <div className="relative w-full md:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}
            className="w-full md:w-80 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-[#39ff14]/30 hover:border-[#39ff14]/60 text-white flex items-center justify-between gap-3 text-xs font-black transition-all shadow-inner cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              {currentActiveTabObj && (
                <currentActiveTabObj.icon className="w-4 h-4 text-[#39ff14] shrink-0" />
              )}
              <span className="truncate">{currentActiveTabObj?.label || 'اختر قسم الإدارة'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#39ff14] transition-transform duration-300 shrink-0 ${menuDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Dropdown Menu */}
          {menuDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 left-0 md:left-auto md:w-96 glass-panel-strong rounded-3xl border border-white/15 shadow-2xl p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 max-h-[75vh] overflow-y-auto">
              {navigationCategories.map((group, gIdx) => {
                if (group.items.length === 0) return null;
                return (
                  <div key={gIdx} className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {group.group}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMenuDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                              isCurrent
                                ? 'bg-[#39ff14] text-slate-950 font-black shadow-md shadow-[#39ff14]/20'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-4 h-4 ${isCurrent ? 'text-slate-950' : 'text-[#39ff14]'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                isCurrent ? 'bg-slate-950 text-[#39ff14]' : 'bg-white/10 text-white'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Access Top Pills for Common Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {[
            { id: 'overview', label: '⚡ الرئيسية', show: !isIRMemberOnly },
            { id: 'members', label: '👥 الأعضاء والبحث', show: isLeader || isIRLead },
            { id: 'evals', label: '🏆 التقييم الشهري', show: true },
            { id: 'recruitment', label: '📝 طلبات التعيين', show: canAccessRecruitmentReview(currentProfile) },
            { id: 'events_mgmt', label: '🎟️ الفعاليات والبوسترات', show: isLeader },
            { id: 'gallery_mgmt', label: '📸 معرض الصور', show: isLeader },
            { id: 'committees', label: '🏢 اللجان', show: isLeader },
            { id: 'supabase_hub', label: '☁️ Supabase', show: canAccessOGCMS(currentProfile) }
          ]
            .filter(item => item.show)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#39ff14] text-slate-950 font-black shadow-md shadow-[#39ff14]/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ⚡ TAB 1: OVERVIEW DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && !isIRMemberOnly && (
        <div className="space-y-8 animate-in fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">إجمالي الأعضاء</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{allProfiles.length}</span>
              <span className="text-[10px] text-[#39ff14] block font-bold">طاقم صيدلة الدلتا المعتمد</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">طلبات الانضمام</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300">{applications.length}</span>
              <span className="text-[10px] text-slate-400 block">نظام الاعتماد المزدوج</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">الفعاليات المسجلة</span>
              <span className="text-2xl sm:text-3xl font-black text-cyan-300">{events.length}</span>
              <span className="text-[10px] text-slate-400 block">{allRegistrations.length} طالب مسجل</span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">التقييمات المعتمدة</span>
              <span className="text-2xl sm:text-3xl font-black text-[#39ff14]">{evaluations.length}</span>
              <span className="text-[10px] text-slate-400 block">شهرياً عبر مسؤولي IR</span>
            </div>
          </div>

          {/* Quick Shortcuts Hub */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => setActiveTab('members')}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#39ff14]/40 transition-all cursor-pointer space-y-3 group shadow-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#39ff14]/15 border border-[#39ff14]/30 flex items-center justify-center text-[#39ff14]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#39ff14] transition-colors">دليل وبحث الأعضاء</h3>
              <p className="text-xs text-slate-400">ابحث عن أي عضو فوراً، تصفح رتبته الكونية (XP)، وتواصل معه عبر واتساب.</p>
            </div>

            <div 
              onClick={() => setActiveTab('events_mgmt')}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#39ff14]/40 transition-all cursor-pointer space-y-3 group shadow-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">إدارة الفعاليات والبوسترات</h3>
              <p className="text-xs text-slate-400">إضافة مؤتمرات وملتقيات صيدلانية، رفع البوسترات، ومتابعة سجل الحضور.</p>
            </div>

            <div 
              onClick={() => setActiveTab('supabase_hub')}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#39ff14]/40 transition-all cursor-pointer space-y-3 group shadow-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#39ff14]">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#39ff14] transition-colors">ربط Supabase السحابي</h3>
              <p className="text-xs text-slate-400">تزامن قاعدة البيانات ومزامنة الأعضاء والفعاليات سحابياً بنقرة واحدة.</p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 👥 TAB 2: MEMBERS DIRECTORY & PROFILE INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'members' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">سجل الأعضاء والبحث المتقدم</h2>
              <p className="text-xs text-slate-400">ابحث عن أي عضو، اطلع على بطاقة رتبته وطاقة الـ XP، وتواصل معه مباشرة.</p>
            </div>

            <button
              onClick={() => AppStore.exportToCSV('aliens_members_data', allProfiles)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#39ff14]" />
              <span>تصدير كـ CSV</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، البريد، الهاتف، أو الرقم الأكاديمي..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:border-[#39ff14] focus:outline-none"
              />
              <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2`} />
            </div>

            <div>
              <select
                value={memberFilterCommittee}
                onChange={(e) => setMemberFilterCommittee(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
              >
                <option value="all">جميع اللجان والفرق</option>
                {committeesList.map(c => (
                  <option key={c.key} value={c.key}>{c.name_ar} ({c.name})</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={memberFilterRole}
                onChange={(e) => setMemberFilterRole(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
              >
                <option value="all">جميع الرتب والمسؤوليات</option>
                <option value="og">مؤسس / قيادة عليا (OG Super Admin)</option>
                <option value="team_head">رئيس النشاط (President / Head)</option>
                <option value="head">رئيس لجنة (Committee Head)</option>
                <option value="sub_head">نائب رئيس لجنة (Sub Head)</option>
                <option value="ir">مسؤول متابعة وتقييم (IR Evaluator)</option>
                <option value="member">عضو معتمد (Active Member)</option>
              </select>
            </div>
          </div>

          {/* Members Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProfiles
              .filter(p => {
                const matchSearch = p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.phone && p.phone.includes(searchQuery)) ||
                  (p.student_id && p.student_id.includes(searchQuery));
                const matchComm = memberFilterCommittee === 'all' || p.committee === memberFilterCommittee;
                const matchRole = memberFilterRole === 'all' || p.role === memberFilterRole;
                return matchSearch && matchComm && matchRole;
              })
              .map(member => {
                const gamified = calculateMemberTier(member.id, evaluations);
                const canSeePhone = canViewMemberPhone(currentProfile, member);
                const waUrl = (canSeePhone && member.phone) ? formatWhatsAppUrl(member.phone, `مرحباً ${member.full_name}، نتواصل معك من نشاط Aliens الطلابي.`) : null;

                return (
                  <div
                    key={member.id}
                    className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-[#39ff14]/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=07101d&color=39ff14`}
                            alt={member.full_name}
                            className="w-12 h-12 rounded-2xl object-cover border border-[#39ff14]/30"
                          />
                          <div>
                            <h3 className="font-black text-white text-sm">{member.full_name}</h3>
                            <span className="text-[11px] text-[#39ff14] font-bold block">{member.position}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl bg-white/5 border ${gamified.tier.borderColor} ${gamified.tier.colorClass}`}>
                          {gamified.tier.badgeIcon} {gamified.tier.tierNameAr}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/5">
                        <div className="p-2 rounded-xl bg-slate-950/50 border border-white/5">
                          <span className="text-slate-400 block text-[9px]">اللجنة التابع لها</span>
                          <span className="font-bold text-white uppercase truncate block">{member.committee || 'General'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/50 border border-white/5">
                          <span className="text-slate-400 block text-[9px]">طاقة الخبرة (XP)</span>
                          <span className="font-black text-amber-300 block">⚡ {gamified.totalXP} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 pt-3 border-t border-white/10 flex-wrap">
                      <button
                        onClick={() => setInspectingProfile(member)}
                        className="flex-1 py-2 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-md shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>البروفايل</span>
                      </button>

                      {/* 🔄 Shift Member Committee */}
                      {isLeader && (
                        <button
                          onClick={() => setShiftingModalData({
                            isOpen: true,
                            member: member
                          })}
                          className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                          title="نقل العضو إلى لجنة أخرى"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* 💬 Smart WhatsApp Dispatcher for IR/Leadership */}
                      {canContactMemberWhatsApp(currentProfile, member) && member.phone && (
                        <button
                          onClick={() => setWhatsAppModalData({
                            isOpen: true,
                            phone: member.phone || '',
                            name: member.full_name,
                            committeeName: member.committee,
                            roleRequested: member.position,
                            member: member
                          })}
                          className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition-all cursor-pointer"
                          title="إرسال رسالة واتساب رسمية ومتابعة دورية"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🎟️ TAB 3: EVENTS MANAGEMENT HUB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'events_mgmt' && isLeader && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">إدارة الفعاليات والمؤتمرات والبوسترات</h2>
              <p className="text-xs text-slate-400">تحكم كامل في نشر الفعاليات، رفع البوسترات، وتصدير ومراجعة الحضور المسجلين.</p>
            </div>

            <button
              onClick={handleOpenAddEvent}
              className="px-5 py-2.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فعالية جديدة ورفع بوستر 🎟️</span>
            </button>
          </div>

          {/* Events List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventRegistrations = allRegistrations.filter(r => r.event_id === event.id);

              return (
                <div
                  key={event.id}
                  className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-[#39ff14]/30 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {event.image_url && (
                      <div className="relative h-48 overflow-hidden bg-slate-950">
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-[#39ff14] border border-white/10">
                          {event.category.toUpperCase()}
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-black text-white line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-2">{event.description}</p>
                      
                      <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#39ff14]" />
                          <span>{event.date} • {event.time || '10:00 AM'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-bold text-cyan-300">{eventRegistrations.length} طالب مسجل</span>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Actions */}
                    <div className="p-4 pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingRegistrationsEvent(event)}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-[#39ff14]" />
                          <span>المسجلين ({eventRegistrations.length})</span>
                        </button>

                        <button
                          onClick={() => setCertificateModalData({
                            isOpen: true,
                            event: event,
                            recipientName: 'د. اسم المشارك'
                          })}
                          className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="توليد وتخصيص شهادات الحضور"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>شهادات 📜</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditEvent(event)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="تعديل الفعالية"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="حذف الفعالية"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📸 TAB 4: GALLERY MANAGEMENT HUB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'gallery_mgmt' && isLeader && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">إدارة معرض الصور والألبومات</h2>
              <p className="text-xs text-slate-400">رفع صور البورد، ألبومات الفعاليات، وتعديل وحذف الصور من الأرشيف الرسمي.</p>
            </div>

            <button
              onClick={handleOpenAddGallery}
              className="px-5 py-2.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>رفع صورة جديدة للمعرض 📸</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((photo) => (
              <div
                key={photo.id}
                className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-[#39ff14]/30 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[9px] text-[#39ff14] font-bold">
                    {photo.tag || 'Aliens'}
                  </span>
                </div>

                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-black text-white truncate">{photo.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{photo.section_name}</p>
                </div>

                <div className="p-3 pt-1 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">{(photo.comments || []).length} تعليق</span>
                  <button
                    onClick={() => handleDeleteGalleryItem(photo.id, photo.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🏢 TAB 5: COMMITTEES MANAGEMENT HUB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'committees' && isLeader && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">إدارة اللجان والفرق التنظيمية</h2>
              <p className="text-xs text-slate-400">إضافة لجان جديدة، تعيين وتحديث مهام كل لجنة، أو حذف اللجان غير المستخدمة.</p>
            </div>

            <button
              onClick={handleOpenAddCommittee}
              className="px-5 py-2.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة لجنة جديدة 🏢</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committeesList.map((comm) => {
              const commMembers = allProfiles.filter(p => p.committee === comm.key);

              return (
                <div
                  key={comm.key}
                  className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#39ff14]/30 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#39ff14]/15 border border-[#39ff14]/30 flex items-center justify-center text-[#39ff14]">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#39ff14]">
                        {comm.key}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white">{comm.name_ar}</h3>
                      <span className="text-xs text-slate-400 font-bold block">{comm.name}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{comm.description}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 block">المهام الأساسية:</span>
                      <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                        {(comm.tasks || []).slice(0, 3).map((task, i) => (
                          <li key={i} className="truncate">{task}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-cyan-300 font-bold">{commMembers.length} عضو مسجل</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCommittee(comm)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="تعديل اللجنة"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCommittee(comm.key, comm.name_ar)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="حذف اللجنة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ☁️ TAB 6: SUPABASE CLOUD INTEGRATION HUB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'supabase_hub' && canAccessOGCMS(currentProfile) && (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-black border border-emerald-500/25">
                <Cloud className="w-3.5 h-3.5 text-[#39ff14]" />
                <span>Supabase PostgreSQL Cloud Integration</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">ربط ومزامنة قاعدة بيانات Supabase</h2>
              <p className="text-xs text-slate-300">قم بربط مشروعك على Supabase لحفظ ومزامنة الأعضاء والتقييمات والفعاليات سحابياً.</p>
            </div>

            <button
              onClick={() => setShowSQLModal(true)}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-black text-slate-200 flex items-center gap-2 cursor-pointer"
            >
              <Code className="w-4 h-4 text-[#39ff14]" />
              <span>كود إنشاء الجداول (SQL Schema)</span>
            </button>
          </div>

          {/* Connection Status Banner */}
          <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
            supabaseStatus === 'connected' 
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : supabaseStatus === 'error'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/90 border-white/10 text-slate-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                supabaseStatus === 'connected' ? 'bg-[#39ff14]/20 text-[#39ff14]' : 'bg-white/10 text-slate-400'
              }`}>
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black block">حالة الاتصال بالسحابة:</span>
                <span className="text-xs">
                  {supabaseStatusMsg || (supabaseUrl ? 'تم إدخال المفاتيح، اضغط اختبار الاتصال للتحقق.' : 'غير مهيأ بعد. يرجى إدخال Project URL و Anon Key أدناه.')}
                </span>
              </div>
            </div>

            <button
              onClick={handleTestSupabase}
              disabled={supabaseTesting}
              className="px-4 py-2.5 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${supabaseTesting ? 'animate-spin' : ''}`} />
              <span>اختبار الاتصال</span>
            </button>
          </div>

          {/* Supabase Keys Setup Form */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-black text-white">إعدادات الاتصال بمشروع Supabase</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Project URL (رابط المشروع)</label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:border-[#39ff14] focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Public Anon Key (مفتاح الوصول العام)</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:border-[#39ff14] focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Push / Pull Sync Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <button
                onClick={handlePushSupabase}
                disabled={isSyncingPush}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className={`w-4 h-4 ${isSyncingPush ? 'animate-bounce' : ''}`} />
                <span>رفع ومزامنة كافة البيانات السحابية (Push to Cloud)</span>
              </button>

              <button
                onClick={handlePullSupabase}
                disabled={isSyncingPull}
                className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CloudDownload className={`w-4 h-4 ${isSyncingPull ? 'animate-bounce' : ''}`} />
                <span>استيراد وتحديث البيانات من السحابة (Pull from Cloud)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🏆 TAB 7: MONTHLY PERFORMANCE EVALUATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'evals' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">التقييم الشهري والرتب الشرفية</h2>
              <p className="text-xs text-slate-400">تقييم سلس وسريع لمعايير الحضور، جودة المهام، التواصل، والعمل الجماعي (+10 XP لكل نقطة).</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                إجمالي التقييمات: <span className="text-[#39ff14] font-black">{evaluations.length}</span>
              </span>
            </div>
          </div>

          {/* Quick Search & Committee Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl glass-panel border border-white/10">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={evalMemberSearch}
                onChange={(e) => setEvalMemberSearch(e.target.value)}
                placeholder="ابحث عن عضو لتقييمه بالاسم..."
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
              />
            </div>

            <select
              value={evalCommFilter}
              onChange={(e) => setEvalCommFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
            >
              <option value="all">جميع اللجان</option>
              {committeesList.map(c => (
                <option key={c.key} value={c.key}>{c.name_ar} ({c.key.toUpperCase()})</option>
              ))}
            </select>
          </div>

          {/* Member Evaluation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluatableMembersForCurrent
              .filter(m => {
                const matchSearch = !evalMemberSearch.trim() || 
                  m.full_name.toLowerCase().includes(evalMemberSearch.toLowerCase()) || 
                  (m.email && m.email.toLowerCase().includes(evalMemberSearch.toLowerCase()));
                const matchComm = evalCommFilter === 'all' || m.committee === evalCommFilter || m.committee_key === evalCommFilter;
                return matchSearch && matchComm;
              })
              .map((member) => {
                const gamified = calculateMemberTier(member.id, evaluations);
                const memberEvals = evaluations.filter(e => e.member_id === member.id);
                const latestEval = memberEvals[memberEvals.length - 1];

                return (
                  <div
                    key={member.id}
                    className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-[#39ff14]/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=07101d&color=39ff14`}
                            alt={member.full_name}
                            className="w-11 h-11 rounded-2xl object-cover border border-[#39ff14]/30"
                          />
                          <div>
                            <h4 className="font-black text-white text-sm">{member.full_name}</h4>
                            <span className="text-[11px] text-[#39ff14] font-bold block">{member.committee?.toUpperCase() || 'Crew'} • {member.position}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 border ${gamified.tier.borderColor} ${gamified.tier.colorClass}`}>
                          {gamified.tier.badgeIcon} {gamified.tier.tierNameAr}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-slate-400 font-bold">طاقة الـ XP</span>
                          <span className="text-sm font-black text-amber-300">⚡ {gamified.totalXP}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-slate-400 font-bold">آخر تقييم</span>
                          <span className="text-sm font-black text-[#39ff14]">{latestEval ? `${latestEval.score}/100` : 'جديد'}</span>
                        </div>
                      </div>

                      {latestEval?.notes && (
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-300 italic line-clamp-2">
                          "{latestEval.notes}"
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenEvaluationModal(member)}
                      className="w-full py-2.5 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-md shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>تقييم العضو الآن ⚡</span>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📝 TAB 8: RECRUITMENT APPLICATIONS REVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'recruitment' && canAccessRecruitmentReview(currentProfile) && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">مراجعة طلبات التعيين والانضمام</h2>
              <p className="text-xs text-slate-400">استعراض إجابات المتقدمين، التواصل المباشر عبر واتساب، ونظام الاعتماد المزدوج (IR + Head).</p>
            </div>
            
            <button
              onClick={() => AppStore.exportToCSV('aliens_recruitment_applications', applications)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#39ff14]" />
              <span>تصدير المتقدمين CSV</span>
            </button>
          </div>

          {/* Status & Search Filters Bar */}
          <div className="space-y-3 p-4 rounded-3xl glass-panel border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recruitmentSearch}
                  onChange={(e) => setRecruitmentSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                />
              </div>

              <select
                value={recruitmentCommFilter}
                onChange={(e) => setRecruitmentCommFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
              >
                <option value="all">جميع اللجان</option>
                {committeesList.map(c => (
                  <option key={c.key} value={c.key}>{c.name_ar} ({c.key.toUpperCase()})</option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'pending', label: 'قيد الانتظار ⏳' },
                { id: 'waiting_for_head', label: 'بانتظار Head 🟣' },
                { id: 'waiting_for_ir', label: 'بانتظار IR 🔵' },
                { id: 'approved', label: 'مقبول ومعتمد ✅' },
                { id: 'rejected', label: 'مرفوض ❌' },
                { id: 'waiting_for_final_decision', label: 'تباين/خلاف ⚠️' }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setRecruitmentStatusFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    recruitmentStatusFilter === pill.id
                      ? 'bg-[#39ff14] text-slate-950 font-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {applications
              .filter(app => {
                const matchSearch = !recruitmentSearch.trim() || 
                  app.applicant_name.toLowerCase().includes(recruitmentSearch.toLowerCase()) || 
                  app.phone.includes(recruitmentSearch);
                const matchComm = recruitmentCommFilter === 'all' || app.committee_key === recruitmentCommFilter;
                const matchStatus = recruitmentStatusFilter === 'all' || app.status === recruitmentStatusFilter;
                return matchSearch && matchComm && matchStatus;
              })
              .map((app) => {
                const isExpanded = expandedAppIds.includes(app.id);
                const answersEntries = Object.entries(app.dynamic_answers || {});
                const isApproved = app.status === 'approved';
                const isRejected = app.status === 'rejected';
                const isConflict = app.status === 'waiting_for_final_decision';

                const waMessage = `مرحباً يا دكتور ${app.applicant_name}، نتواصل معك من طاقم Aliens Student Activity بكلية الصيدلة بخصوص طلب انضمامك للجنة (${app.committee_name || app.committee_key}) لتحديد موعد المقابلة الشخصية.`;
                const waLink = formatWhatsAppUrl(app.phone, waMessage);

                return (
                  <div 
                    key={app.id} 
                    className={`glass-panel p-5 sm:p-6 rounded-3xl border transition-all space-y-4 shadow-xl ${
                      isApproved
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : isRejected
                          ? 'border-rose-500/30 bg-rose-950/10'
                          : isConflict
                            ? 'border-amber-500/40 bg-amber-950/10'
                            : 'border-white/10'
                    }`}
                  >
                    {/* Header Info */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-black text-white text-lg">{app.applicant_name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30 text-xs font-black">
                            لجنة: {app.committee_name || app.committee_key.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-bold">
                            الفرقة: {app.faculty_level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          📞 الهاتف: <span className="text-slate-200 font-mono" dir="ltr">{app.phone}</span> • 📅 تاريخ التقديم: {new Date(app.created_at).toLocaleDateString('ar-EG')}
                        </p>
                      </div>

                      {/* Top Action Buttons: Smart WhatsApp, Shift Committee, Expand & Status */}
                      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                        {/* 💬 Smart WhatsApp Template Dispatcher Button */}
                        <button
                          onClick={() => setWhatsAppModalData({
                            isOpen: true,
                            phone: app.phone,
                            name: app.applicant_name,
                            committeeName: app.committee_name || app.committee_key,
                            roleRequested: app.role_requested || 'Active Member',
                            application: app
                          })}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>واتساب ذكي 💬</span>
                        </button>

                        {/* 🔄 Shift Committee Button */}
                        {(isLeader || currentProfile?.role === 'head' || currentProfile?.role === 'sub_head') && (
                          <button
                            onClick={() => setShiftingModalData({
                              isOpen: true,
                              application: app
                            })}
                            className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            title="نقل وتوجيه المتقدم للجنة أخرى"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>نقل اللجنة</span>
                          </button>
                        )}

                        {/* Expand Answers Toggle */}
                        <button
                          onClick={() => toggleExpandApp(app.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isExpanded
                              ? 'bg-white/15 text-white border-white/30'
                              : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-[#39ff14]" />
                          <span>{isExpanded ? 'إخفاء الإجابات' : 'استعراض الإجابات (' + answersEntries.length + ')'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                          isApproved
                            ? 'bg-emerald-950/80 text-[#39ff14] border-[#39ff14]/40'
                            : isRejected
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                              : isConflict
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {app.status === 'approved' ? 'مقبول كعضو نشط ✅' :
                           app.status === 'rejected' ? 'مرفوض ❌' :
                           app.status === 'waiting_for_final_decision' ? 'خلاف قرار (مطلوب القيادة) ⚠️' :
                           app.status === 'waiting_for_head' ? 'بانتظار قرار Head 🟣' :
                           app.status === 'waiting_for_ir' ? 'بانتظار قرار IR 🔵' : 'قيد المراجعة ⏳'}
                        </span>
                      </div>
                    </div>

                    {/* 📜 Detailed Answers Expander Panel */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                          <Sparkles className="w-4 h-4 text-[#39ff14]" />
                          <h4 className="text-xs font-black text-[#39ff14] uppercase tracking-wider">
                            إجابات أسئلة التقديم وبنك الأسئلة
                          </h4>
                        </div>

                        {answersEntries.length === 0 ? (
                          <p className="text-xs text-slate-400">لا توجد إجابات مسجلة لهذا الطلب.</p>
                        ) : (
                          <div className="space-y-3">
                            {answersEntries.map(([question, answer], qIdx) => (
                              <div key={qIdx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="w-5 h-5 rounded-lg bg-[#39ff14]/15 text-[#39ff14] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                    Q{qIdx + 1}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-200">{question}</h5>
                                </div>
                                <div className="pr-7 text-xs text-emerald-300 leading-relaxed font-medium bg-black/30 p-2.5 rounded-lg border border-white/5">
                                  {answer || 'لم يتم تقديم إجابة'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ⚖️ Dual Approval Decision Controls Box */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* IR Evaluator Box */}
                        <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-cyan-300">قرار مسؤول المتابعة والعلاقات (IR):</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              app.ir_decision === 'approve' ? 'bg-emerald-500/20 text-[#39ff14]' :
                              app.ir_decision === 'reject' ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-slate-400'
                            }`}>
                              {app.ir_decision === 'approve' ? 'موافق ✅' : app.ir_decision === 'reject' ? 'مرفوض ❌' : 'قيد الانتظار ⏳'}
                            </span>
                          </div>

                          {app.ir_evaluator_name && (
                            <p className="text-[10px] text-slate-400">بواسطة: {app.ir_evaluator_name}</p>
                          )}
                          {app.ir_decision_note && (
                            <p className="text-[11px] text-cyan-200 bg-blue-950/40 p-2 rounded-lg italic">"{app.ir_decision_note}"</p>
                          )}

                          {/* IR Decision Action Buttons */}
                          {(isIREvaluator(currentProfile) || isOG(currentProfile.role)) && (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleDualDecision(app.id, 'approve', 'ir')}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black transition-all cursor-pointer"
                              >
                                اعتماد IR ✅
                              </button>
                              <button
                                onClick={() => handleDualDecision(app.id, 'reject', 'ir')}
                                className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black transition-all cursor-pointer"
                              >
                                رفض IR ❌
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Committee Head Box */}
                        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-purple-300">قرار رئيس اللجنة (Committee Head):</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              app.head_decision === 'approve' ? 'bg-emerald-500/20 text-[#39ff14]' :
                              app.head_decision === 'reject' ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-slate-400'
                            }`}>
                              {app.head_decision === 'approve' ? 'موافق ✅' : app.head_decision === 'reject' ? 'مرفوض ❌' : 'قيد الانتظار ⏳'}
                            </span>
                          </div>

                          {app.head_evaluator_name && (
                            <p className="text-[10px] text-slate-400">بواسطة: {app.head_evaluator_name}</p>
                          )}
                          {app.head_decision_note && (
                            <p className="text-[11px] text-purple-200 bg-purple-950/40 p-2 rounded-lg italic">"{app.head_decision_note}"</p>
                          )}

                          {/* Head Decision Action Buttons */}
                          {(isLeaderOrHead(currentProfile.role) || isOG(currentProfile.role)) && (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleDualDecision(app.id, 'approve', 'head')}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black transition-all cursor-pointer"
                              >
                                اعتماد Head ✅
                              </button>
                              <button
                                onClick={() => handleDualDecision(app.id, 'reject', 'head')}
                                className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black transition-all cursor-pointer"
                              >
                                رفض Head ❌
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Leadership / OG Direct Override */}
                      {isTeamLeadership(currentProfile.role) && (
                        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            صلاحيات الاعتماد المباشر للقيادة العليا (OG Override):
                          </span>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleOverrideDecision(app.id, 'approved')}
                              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-[#39ff14] text-slate-950 text-xs font-black hover:brightness-110 cursor-pointer"
                            >
                              ترقية وتعيين فوري كعضو نشط 🚀
                            </button>
                            <button
                              onClick={() => handleOverrideDecision(app.id, 'rejected')}
                              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-500 text-rose-300 text-xs font-bold hover:bg-rose-900 cursor-pointer"
                            >
                              رفض نهائي ❌
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="حذف الطلب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📊 TAB 9: DATA ANALYTICS HUB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'analytics' && canAccessDataAnalytics(currentProfile) && (
        <div className="animate-in fade-in">
          <DataAnalyticsHub 
            applications={applications}
            evaluations={evaluations}
            events={events}
            registrations={allRegistrations}
            profiles={allProfiles}
            questions={allQuestions}
            auditLogs={auditLogs}
            accessCodes={accessCodes}
            committees={committeesList}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🔑 TAB 10: ACCESS CODES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'codes' && isLeader && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-xl sm:text-2xl font-black text-white">أكواد العضوية والانضمام المباشر</h2>
          
          <form onSubmit={handleCreateAccessCode} className="glass-panel p-6 rounded-3xl border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={newCodeName}
              onChange={(e) => setNewCodeName(e.target.value)}
              placeholder="اسم الكود (مثال: MKT2026)..."
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
            />
            <select
              value={newCodeCommittee}
              onChange={(e) => setNewCodeCommittee(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
            >
              {committeesList.map(c => (
                <option key={c.key} value={c.key}>{c.name_ar}</option>
              ))}
            </select>
            <input
              type="number"
              value={newCodeMaxUses}
              onChange={(e) => setNewCodeMaxUses(Number(e.target.value))}
              placeholder="الحد الأقصى للاستخدام"
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
            />
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 cursor-pointer"
            >
              إصدار كود جديد 🔑
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {accessCodes.map(code => (
              <div key={code.id} className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-[#39ff14] text-base block">{code.code}</span>
                  <span className="text-xs text-slate-400">{code.committee} • {code.current_uses}/{code.max_uses}</span>
                </div>
                <button
                  onClick={() => AppStore.deleteAccessCode(code.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📜 TAB 11: AUDIT LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'logs' && (isLeader || isIRLead) && (
        <div className="space-y-4 animate-in fade-in">
          <h2 className="text-xl sm:text-2xl font-black text-white">سجل العمليات والرقابة (Audit Logs)</h2>
          <div className="space-y-2">
            {auditLogs.slice(0, 50).map(log => (
              <div key={log.id} className="p-3.5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{log.action} • <span className="text-[#39ff14]">{log.target}</span></span>
                  <span className="text-[10px] text-slate-400">{log.new_value}</span>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ⚙️ TAB 12: OG CMS & SITE MASTER PANEL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'og_panel' && canAccessOGCMS(currentProfile) && (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39ff14]/15 text-[#39ff14] text-xs font-black border border-[#39ff14]/30 mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>OG Master Control & Settings Suite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">إعدادات المنصة، اللوائح، ونظام الأتمتة الشامل</h2>
              <p className="text-xs text-slate-400 mt-1">تخصيص كامل لمعايير التقييم، شروط التحذيرات المرنة، قوالب رسائل الواتساب، والحدود الاستيعابية للجان.</p>
            </div>

            <button
              onClick={handleSaveCMS}
              className="px-6 py-3.5 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 shadow-xl shadow-[#39ff14]/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتطبيق كافة الإعدادات 🚀</span>
            </button>
          </div>

          <form onSubmit={handleSaveCMS} className="space-y-8">
            {/* 1️⃣ SECTION: GENERAL CMS & HERO CONTENT */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <Globe className="w-5 h-5 text-[#39ff14]" />
                <h3 className="text-base font-black text-white">1. إعدادات الواجهة والمحتوى العام (General CMS)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">عنوان المنصة الرئيسي (Hero Headline)</label>
                  <input
                    type="text"
                    value={cmsHeroTitle}
                    onChange={(e) => setCmsHeroTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">حالة باب الانضمام والتقديم (Recruitment Status)</label>
                  <select
                    value={cmsRecruitmentStatus}
                    onChange={(e) => setCmsRecruitmentStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  >
                    <option value="open">🟢 مفتوح للتقديم (Recruitment Open)</option>
                    <option value="closed">🔴 مغلق مؤقتاً (Recruitment Closed)</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-300">الوصف التعريفي للنشاط (Hero Subtitle)</label>
                  <textarea
                    rows={2}
                    value={cmsHeroDesc}
                    onChange={(e) => setCmsHeroDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">شريط الإعلانات العاجل (Announcement Banner)</label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={cmsAnnouncementActive}
                        onChange={(e) => setCmsAnnouncementActive(e.target.checked)}
                        className="rounded accent-[#39ff14]"
                      />
                      <span>تفعيل الشريط أعلى الموقع</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={cmsAnnouncement}
                    onChange={(e) => setCmsAnnouncement(e.target.value)}
                    placeholder="اكتب رسالة الإعلان..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">هاتف مسؤول العلاقات العامة (PR Head)</label>
                  <input
                    type="text"
                    value={cmsPrHeadPhone}
                    onChange={(e) => setCmsPrHeadPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">هاتف نائب العلاقات العامة (PR Sub-Head)</label>
                  <input
                    type="text"
                    value={cmsPrSubPhone}
                    onChange={(e) => setCmsPrSubPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* 2️⃣ SECTION: FLEXIBLE WARNING RULES & COMMITTEE LIMITS */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">2. نظام التحذيرات التلقائي والحدود الاستيعابية للجان (Flexible Quotas & Rules)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Warning Threshold */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="text-xs font-black text-amber-300 block">حد درجة الإنذار (%)</label>
                  <p className="text-[11px] text-slate-400">إذا قل متوسط تقييم العضو عن هذه النسبة يصدر تحذير تلقائي:</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="30"
                      max="90"
                      value={cmsWarningThreshold}
                      onChange={(e) => setCmsWarningThreshold(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-black text-sm text-center"
                    />
                    <span className="text-xs font-bold text-slate-300">% من 100</span>
                  </div>
                </div>

                {/* Consecutive Months */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="text-xs font-black text-cyan-300 block">شهور التقييم المتتالية</label>
                  <p className="text-[11px] text-slate-400">مرونة مدة المتابعة (شهر واحد، شهرين، 3 شهور، 6 شهور):</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={cmsWarningMonths}
                      onChange={(e) => setCmsWarningMonths(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono font-black text-sm text-center"
                    />
                    <span className="text-xs font-bold text-slate-300">أشهر متتالية</span>
                  </div>
                </div>

                {/* IR Limit */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="text-xs font-black text-[#39ff14] block">الحد الأقصى لأعضاء IR</label>
                  <p className="text-[11px] text-slate-400">سقف استيعاب لجنة العلاقات الداخلية والتنظيم:</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="5"
                      max="200"
                      value={cmsIrMaxLimit}
                      onChange={(e) => setCmsIrMaxLimit(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-[#39ff14]/40 text-[#39ff14] font-mono font-black text-sm text-center"
                    />
                    <span className="text-xs font-bold text-slate-300">عضو كحد أقصى</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3️⃣ SECTION: DYNAMIC EVALUATION CRITERIA BUILDER */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-[#39ff14]" />
                  <div>
                    <h3 className="text-base font-black text-white">3. معايير التقييم الشهري المرنة (Dynamic Evaluation Criteria)</h3>
                    <p className="text-xs text-slate-400">يمكنك تعديل أسماء المعايير، أوزان الدرجات، أو إضافة معايير جديدة ومستحدثة حسب قرارات القيادة.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCriterion}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>إضافة معيار جديد</span>
                </button>
              </div>

              <div className="space-y-3">
                {cmsCriteria.map((crit, idx) => (
                  <div key={crit.id || idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[#39ff14]">
                        #{idx + 1} {crit.key}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="حذف هذا المعيار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400">اسم المعيار (بالعربية)</label>
                        <input
                          type="text"
                          value={crit.label_ar}
                          onChange={(e) => handleUpdateCriterion(idx, { label_ar: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400">اسم المعيار (English)</label>
                        <input
                          type="text"
                          value={crit.label}
                          onChange={(e) => handleUpdateCriterion(idx, { label: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400">الحد الأقصى للدرجة (Max Points)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={crit.max_points}
                          onChange={(e) => handleUpdateCriterion(idx, { max_points: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono font-black focus:border-[#39ff14] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">وصف المعيار وإرشادات القياس</label>
                      <input
                        type="text"
                        value={crit.description || ''}
                        onChange={(e) => handleUpdateCriterion(idx, { description: e.target.value })}
                        placeholder="طريقة تقييم هذا المعيار..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs focus:border-[#39ff14] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4️⃣ SECTION: DYNAMIC WHATSAPP TEMPLATES MANAGER */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-black text-white">4. قوالب رسائل الواتساب المرنة (Custom WhatsApp Templates)</h3>
                    <p className="text-xs text-slate-400">قوالب جاهزة قابلة للتعديل للمقابلات، القبول، التحذيرات، والاجتماعات مع دعم المتغيرات التلقائية.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddTemplate}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>إضافة قالب واتساب جديد</span>
                </button>
              </div>

              {/* Supported Variables Guide Chips */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-emerald-300">المتغيرات التلقائية المدعومة في النص:</span>
                <span className="px-2 py-0.5 rounded-md bg-black/40 text-[#39ff14] font-mono text-[11px]">{'{name}'} (الاسم)</span>
                <span className="px-2 py-0.5 rounded-md bg-black/40 text-cyan-300 font-mono text-[11px]">{'{committee}'} (اللجنة)</span>
                <span className="px-2 py-0.5 rounded-md bg-black/40 text-amber-300 font-mono text-[11px]">{'{date}'} (الموعد)</span>
                <span className="px-2 py-0.5 rounded-md bg-black/40 text-rose-300 font-mono text-[11px]">{'{location}'} (المكان)</span>
                <span className="px-2 py-0.5 rounded-md bg-black/40 text-purple-300 font-mono text-[11px]">{'{code}'} (كود العضوية)</span>
              </div>

              <div className="space-y-4">
                {cmsTemplates.map((tmpl, idx) => (
                  <div key={tmpl.id || idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <h4 className="text-xs font-black text-white">{tmpl.title}</h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTemplate(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="حذف هذا القالب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400">عنوان القالب</label>
                        <input
                          type="text"
                          value={tmpl.title}
                          onChange={(e) => handleUpdateTemplate(idx, { title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400">تصنيف القالب</label>
                        <select
                          value={tmpl.category}
                          onChange={(e) => handleUpdateTemplate(idx, { category: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                        >
                          <option value="interview">مقابلة شخصية (Interview)</option>
                          <option value="acceptance">قبول وتفعيل عضوية (Acceptance)</option>
                          <option value="warning">إنذار ومتابعة أداء (Warning)</option>
                          <option value="meeting">دعوة لاجتماع (Meeting)</option>
                          <option value="general">عام / أخرى (General)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">نص الرسالة</label>
                      <textarea
                        rows={4}
                        value={tmpl.message}
                        onChange={(e) => handleUpdateTemplate(idx, { message: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-emerald-200 text-xs font-mono leading-relaxed focus:border-[#39ff14] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5️⃣ SECTION: ACTIVE MEMBER WARNINGS & DIRECT STRIKES */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-base font-black text-white">5. سجل الإنذارات والتحذيرات الصادرة (Member Warnings Ledger)</h3>
                  <p className="text-xs text-slate-400">إصدار إنذار يدوي، مراجعة الإنذارات التلقائية الناتجة عن تراجع التقييم، وإلغاء الإنذارات عند تصحيح المسار.</p>
                </div>
              </div>

              {/* Manual Warning Issue Box */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
                <h4 className="text-xs font-black text-rose-300">إصدار إنذار رسمي مباشر لعضو:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={manualWarningMemberId}
                    onChange={(e) => setManualWarningMemberId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-white text-xs focus:outline-none"
                  >
                    <option value="">-- اختر العضو المراد إنذاره --</option>
                    {allProfiles.filter(p => p.role !== 'guest').map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.committee?.toUpperCase() || 'General'})</option>
                    ))}
                  </select>

                  <select
                    value={manualWarningSeverity}
                    onChange={(e) => setManualWarningSeverity(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-white text-xs focus:outline-none"
                  >
                    <option value="verbal">تنبيه شفهي (Verbal Notice)</option>
                    <option value="written">إنذار كتابي رسمي (Written Strike)</option>
                    <option value="final_strike">إنذار نهائي قبل الفصل (Final Strike)</option>
                  </select>

                  <input
                    type="text"
                    value={manualWarningReason}
                    onChange={(e) => setManualWarningReason(e.target.value)}
                    placeholder="سبب الإنذار والتفاصيل..."
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-white text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleIssueManualWarning}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>تثبيت وإصدار الإنذار في ملف العضو ⚠️</span>
                </button>
              </div>

              {/* Active Warnings Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">الإنذارات المسجلة حالياً في النظام ({warningsList.length}):</h4>
                {warningsList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    لا توجد إنذارات مسجلة حالياً، أداء طاقم العمل منضبط وممتاز! ✨
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {warningsList.map((warn) => (
                      <div key={warn.id} className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/20 flex items-center justify-between text-xs flex-wrap gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{warn.member_name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                              {warn.warning_type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">لجنة: {warn.member_committee}</span>
                          </div>
                          <p className="text-xs text-slate-300">"{warn.reason}"</p>
                          <span className="text-[10px] text-slate-500 block">صدر بواسطة: {warn.issued_by_name} • {new Date(warn.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleResolveWarning(warn.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تسوية وإلغاء الإنذار</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Save CTA Bar */}
            <button
              type="submit"
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-sm hover:brightness-110 cursor-pointer shadow-xl shadow-[#39ff14]/25 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>حفظ واعتماد كافة التعديلات والإعدادات فوراً 🚀</span>
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🚀 MODAL 1: MEMBER FULL PROFILE INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      {inspectingProfile && (
        <PublicProfileModal
          profile={inspectingProfile}
          onClose={() => setInspectingProfile(null)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🎟️ MODAL 2: EVENT POSTER & DETAILS MODAL */}
      {/* ------------------------------------------------------------- */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-4">
            <button
              onClick={() => setEventModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white">
              {editingEventId ? 'تعديل بيانات الفعالية والبوستر' : 'إضافة فعالية جديدة ورفع البوستر'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">عنوان الفعالية</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">التصنيف</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  >
                    <option value="job_fair">معرض توظيف (Job Fair)</option>
                    <option value="academic">مؤتمر أكاديمي</option>
                    <option value="workshop">ورشة عمل</option>
                    <option value="cultural">ندوة ثقافية</option>
                    <option value="community">نشاط مجتمعي</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              {/* Poster file input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">بوستر الفعالية</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={eventPosterInputRef}
                    onChange={handleEventPosterUpload}
                    accept="image/*"
                    className="hidden"
                    id="admin-event-poster"
                  />
                  <label
                    htmlFor="admin-event-poster"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#39ff14]" />
                    <span>رفع بوستر من جهازك</span>
                  </label>

                  <input
                    type="url"
                    value={eventImageUrl}
                    onChange={(e) => {
                      setEventImageUrl(e.target.value);
                      if (e.target.value.startsWith('http')) setEventImagePreview(e.target.value);
                    }}
                    placeholder="أو رابط البوستر..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                {eventImagePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-40 bg-slate-950">
                    <img src={eventImagePreview} alt="Poster" className="max-h-40 w-full object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">وصف الفعالية</label>
                <textarea
                  rows={3}
                  required
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 cursor-pointer"
              >
                حفظ ونشر الفعالية 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📸 MODAL 3: GALLERY UPLOAD MODAL */}
      {/* ------------------------------------------------------------- */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-4">
            <button
              onClick={() => setGalleryModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white">رفع صورة جديدة لمعرض النشاط</h3>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">عنوان الصورة</label>
                <input
                  type="text"
                  required
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="مثال: صورة المجلس التنفيذي..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">القسم / الألبوم</label>
                  <select
                    value={gallerySection}
                    onChange={(e) => setGallerySection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  >
                    <option value="مجلس الإدارة والقيادة (Board & Leadership)">مجلس الإدارة والقيادة (Board)</option>
                    <option value="فعاليات ومؤتمرات الصيدلة">فعاليات ومؤتمرات الصيدلة</option>
                    <option value="ملتقيات التوظيف والتدريب">ملتقيات التوظيف والتدريب</option>
                    <option value="ورش عمل اللجان والتكريمات">ورش عمل اللجان والتكريمات</option>
                    <option value="عام / General Moments">عام / General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الوسم (Tag)</label>
                  <input
                    type="text"
                    value={galleryTag}
                    onChange={(e) => setGalleryTag(e.target.value)}
                    placeholder="board, summit..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">ملف الصورة</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={galleryFileInputRef}
                    onChange={handleGalleryFileUpload}
                    accept="image/*"
                    className="hidden"
                    id="admin-gallery-file"
                  />
                  <label
                    htmlFor="admin-gallery-file"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#39ff14]" />
                    <span>اختر صورة من جهازك</span>
                  </label>

                  <input
                    type="url"
                    value={galleryImageUrl}
                    onChange={(e) => {
                      setGalleryImageUrl(e.target.value);
                      if (e.target.value.startsWith('http')) setGalleryImagePreview(e.target.value);
                    }}
                    placeholder="أو رابط الصورة..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                {galleryImagePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-40 bg-slate-950">
                    <img src={galleryImagePreview} alt="Preview" className="max-h-40 w-full object-contain" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 cursor-pointer"
              >
                تأكيد ونشر الصورة في المعرض 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🏢 MODAL 4: COMMITTEE ADD/EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {commModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-4">
            <button
              onClick={() => setCommModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white">
              {editingCommKey ? `تعديل بيانات لجنة (${commNameAr})` : 'إضافة وتدشين لجنة جديدة'}
            </h3>

            <form onSubmit={handleSaveCommittee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">اسم اللجنة بالعربية</label>
                  <input
                    type="text"
                    required
                    value={commNameAr}
                    onChange={(e) => setCommNameAr(e.target.value)}
                    placeholder="مثال: لجنة العلاقات العامة"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">اسم اللجنة بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={commName}
                    onChange={(e) => setCommName(e.target.value)}
                    placeholder="Public Relations"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">رمز / مفتاح اللجنة (Code Key)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCommKey}
                    value={commKey}
                    onChange={(e) => setCommKey(e.target.value)}
                    placeholder="pr, marketing, logistics..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الشعار / التاج (Tag)</label>
                  <input
                    type="text"
                    value={commTag}
                    onChange={(e) => setCommTag(e.target.value)}
                    placeholder="Partnerships & Sponsors"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">وصف وأهداف اللجنة</label>
                <textarea
                  rows={2}
                  required
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  placeholder="وصف لدور اللجنة وأهدافها..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">المهام الأساسية (مهمة في كل سطر)</label>
                <textarea
                  rows={3}
                  value={commTasks}
                  onChange={(e) => setCommTasks(e.target.value)}
                  placeholder="مهمة 1&#10;مهمة 2&#10;مهمة 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#39ff14] text-slate-950 font-black text-xs hover:brightness-110 cursor-pointer"
              >
                {editingCommKey ? 'حفظ تعديلات اللجنة' : 'تدشين اللجنة في النظام 🏢'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🏆 MODAL 5: EVALUATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {evalModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-5">
            <button
              onClick={() => setEvalModalMember(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pr-2">
              <img
                src={evalModalMember.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(evalModalMember.full_name)}&background=07101d&color=39ff14`}
                alt={evalModalMember.full_name}
                className="w-12 h-12 rounded-2xl object-cover border border-[#39ff14]/40 shrink-0"
              />
              <div>
                <h3 className="text-lg font-black text-white">تقييم العضو: {evalModalMember.full_name}</h3>
                <span className="text-xs text-[#39ff14] font-bold">
                  لجنة {evalModalMember.committee?.toUpperCase() || 'GENERAL'} • {evalModalMember.position}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Score Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">خيارات سريعة بنقرة واحدة:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'أسطوري 100%', pct: 100, color: 'hover:border-amber-400 text-amber-300' },
                  { label: 'ممتاز 90%', pct: 90, color: 'hover:border-[#39ff14] text-[#39ff14]' },
                  { label: 'جيد جداً 80%', pct: 80, color: 'hover:border-cyan-400 text-cyan-300' },
                  { label: 'متوسط 65%', pct: 65, color: 'hover:border-slate-400 text-slate-300' }
                ].map(preset => (
                  <button
                    key={preset.pct}
                    type="button"
                    onClick={() => applyScorePreset(preset.pct)}
                    className={`py-1.5 px-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black text-center transition-all cursor-pointer ${preset.color}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              {/* Sliders with live value badges */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">معيار الحضور والانضباط (20)</span>
                    <span className="font-black text-[#39ff14] font-mono">{evalAttendance} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={evalAttendance}
                    onChange={(e) => setEvalAttendance(Number(e.target.value))}
                    className="w-full accent-[#39ff14] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">جودة تنفيذ المهام والتسليم (20)</span>
                    <span className="font-black text-[#39ff14] font-mono">{evalTasksQuality} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={evalTasksQuality}
                    onChange={(e) => setEvalTasksQuality(Number(e.target.value))}
                    className="w-full accent-[#39ff14] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">التواصل والتفاعل الفعال (20)</span>
                    <span className="font-black text-[#39ff14] font-mono">{evalCommunication} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={evalCommunication}
                    onChange={(e) => setEvalCommunication(Number(e.target.value))}
                    className="w-full accent-[#39ff14] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">العمل الجماعي وروح الفريق (20)</span>
                    <span className="font-black text-[#39ff14] font-mono">{evalTeamwork} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={evalTeamwork}
                    onChange={(e) => setEvalTeamwork(Number(e.target.value))}
                    className="w-full accent-[#39ff14] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">المبادرة والإبداع بالأنشطة (20)</span>
                    <span className="font-black text-[#39ff14] font-mono">{evalInitiative} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={evalInitiative}
                    onChange={(e) => setEvalInitiative(Number(e.target.value))}
                    className="w-full accent-[#39ff14] cursor-pointer"
                  />
                </div>
              </div>

              {/* Total Score & Cosmic XP Preview Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-[#39ff14]/40 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">المجموع والنتيجة:</span>
                  <span className="text-xl font-black text-[#39ff14] font-mono">{calculatedTotalScore} / 100</span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-amber-300 font-bold block">مكافأة الطاقة الكونية:</span>
                  <span className="text-sm font-black text-amber-400">⚡ +{calculatedTotalScore * 10} XP</span>
                </div>
              </div>

              {/* Quick Feedback Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">رسائل تحفيز وملاحظات جاهزة:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'أداء استثنائي وعضو متميز جداً 🌟',
                    'التزام رائع بجودة ومواعيد تسليم المهام 🚀',
                    'تفاعل إيجابي وروح عمل جماعي ملهمة 🤝',
                    'يحتاج لمزيد من الانضباط في مواعيد الاجتماعات ⏳'
                  ].map((presetNote, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEvalNotes(presetNote)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-white transition-all cursor-pointer text-right"
                    >
                      {presetNote}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ملاحظات التقييم والتوصية</label>
                <textarea
                  rows={2}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="اكتب رسالة تحفيزية أو توصية للعضو..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-[#39ff14] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#39ff14] to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-[#39ff14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>اعتماد وتثبيت التقييم الشهري 🏆</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 👥 MODAL 6: EVENT REGISTRATIONS LIST MODAL */}
      {/* ------------------------------------------------------------- */}
      {viewingRegistrationsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-4">
            <button
              onClick={() => setViewingRegistrationsEvent(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <h3 className="text-xl font-black text-white">المسجلون في فعالية: {viewingRegistrationsEvent.title}</h3>
                <span className="text-xs text-slate-400">{viewingRegistrationsEvent.date}</span>
              </div>
              <button
                onClick={() => AppStore.exportToCSV(`attendees_${viewingRegistrationsEvent.title}`, allRegistrations.filter(r => r.event_id === viewingRegistrationsEvent.id))}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#39ff14]" />
                <span>تصدير CSV</span>
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allRegistrations.filter(r => r.event_id === viewingRegistrationsEvent.id).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">لا يوجد مسجلين حتى الآن في هذه الفعالية.</p>
              ) : (
                allRegistrations
                  .filter(r => r.event_id === viewingRegistrationsEvent.id)
                  .map((reg) => (
                    <div key={reg.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div>
                        <h4 className="font-bold text-white">{reg.full_name}</h4>
                        <span className="text-[10px] text-slate-400 block">{reg.email} • {reg.phone} • Level {reg.faculty_level}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* 🎟️ View QR Ticket Button */}
                        <button
                          onClick={() => setTicketModalData({
                            isOpen: true,
                            event: viewingRegistrationsEvent,
                            registration: reg
                          })}
                          className="px-2.5 py-1 rounded-xl bg-[#39ff14]/15 hover:bg-[#39ff14]/25 text-[#39ff14] border border-[#39ff14]/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="استعراض وطباعة تذكرة الدخول الرسمية"
                        >
                          <Ticket className="w-3 h-3" />
                          <span>تذكرة QR</span>
                        </button>

                        {/* 📜 Issue Certificate Button */}
                        <button
                          onClick={() => setCertificateModalData({
                            isOpen: true,
                            event: viewingRegistrationsEvent,
                            recipientName: reg.full_name
                          })}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="إصدار شهادة مشاركة للمسجل"
                        >
                          <Award className="w-3 h-3" />
                          <span>شهادة</span>
                        </button>

                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          {reg.status}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 💻 MODAL 7: SUPABASE SQL SCHEMA MODAL */}
      {/* ------------------------------------------------------------- */}
      {showSQLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowSQLModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <h3 className="text-xl font-black text-white">كود إنشاء جداول Supabase (SQL Script)</h3>
                <p className="text-xs text-slate-400">انسخ هذا الكود والصقه في Supabase Dashboard &rarr; SQL Editor ثم اضغط Run.</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getSupabaseSQLSchema());
                  showSuccess('تم نسخ كود SQL إلى الحافظة بنجاح!');
                }}
                className="px-4 py-2 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#39ff14]/20"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الكود الكامل</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed text-left" dir="ltr">
              {getSupabaseSQLSchema()}
            </pre>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 💬 MODAL 8: WHATSAPP TEMPLATES DISPATCHER MODAL */}
      {/* ------------------------------------------------------------- */}
      {whatsAppModalData.isOpen && (
        <WhatsAppTemplateModal
          isOpen={whatsAppModalData.isOpen}
          onClose={() => setWhatsAppModalData(prev => ({ ...prev, isOpen: false }))}
          targetPhone={whatsAppModalData.phone}
          targetName={whatsAppModalData.name}
          committeeName={whatsAppModalData.committeeName}
          roleRequested={whatsAppModalData.roleRequested}
          application={whatsAppModalData.application}
          member={whatsAppModalData.member}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🔄 MODAL 9: COMMITTEE SHIFTING / REASSIGNMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {shiftingModalData.isOpen && currentProfile && (
        <CommitteeShiftingModal
          isOpen={shiftingModalData.isOpen}
          onClose={() => setShiftingModalData({ isOpen: false })}
          application={shiftingModalData.application}
          member={shiftingModalData.member}
          currentUser={currentProfile}
          onSuccess={refreshAllData}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🎟️ MODAL 10: EVENT QR TICKET MODAL */}
      {/* ------------------------------------------------------------- */}
      {ticketModalData.isOpen && ticketModalData.event && ticketModalData.registration && (
        <EventTicketModal
          isOpen={ticketModalData.isOpen}
          onClose={() => setTicketModalData({ isOpen: false })}
          event={ticketModalData.event}
          registration={ticketModalData.registration}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📜 MODAL 11: CERTIFICATE GENERATOR MODAL */}
      {/* ------------------------------------------------------------- */}
      {certificateModalData.isOpen && certificateModalData.event && (
        <CertificateModal
          isOpen={certificateModalData.isOpen}
          onClose={() => setCertificateModalData({ isOpen: false })}
          event={certificateModalData.event}
          recipientName={certificateModalData.recipientName}
          recipientProfile={certificateModalData.recipientProfile}
        />
      )}

    </div>
  );
};
