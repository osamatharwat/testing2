import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  Layers,
  Database,
  Search,
  PieChart,
  ShieldAlert
} from 'lucide-react';
import { 
  Application, 
  DynamicQuestion, 
  EventItem, 
  EventRegistration, 
  PerformanceEvaluation, 
  Profile, 
  AuditLog, 
  AccessCode,
  CommitteeEntity
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  exportApplicantsCSV, 
  exportEventRegistrationsCSV, 
  exportEvaluationsCSV, 
  exportMembersRosterCSV, 
  exportAuditLogsCSV,
  downloadFile
} from '../../lib/exportUtils';

interface DataAnalyticsHubProps {
  applications: Application[];
  evaluations: PerformanceEvaluation[];
  events: EventItem[];
  registrations: EventRegistration[];
  profiles: Profile[];
  questions: DynamicQuestion[];
  auditLogs: AuditLog[];
  accessCodes: AccessCode[];
  committees: CommitteeEntity[];
}

export const DataAnalyticsHub: React.FC<DataAnalyticsHubProps> = ({
  applications = [],
  evaluations = [],
  events = [],
  registrations = [],
  profiles = [],
  questions = [],
  auditLogs = [],
  accessCodes = [],
  committees = []
}) => {
  const { language, isRtl } = useLanguage();
  const [selectedCommittee, setSelectedCommittee] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setExportFeedback(msg);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  // --- KPI CALCULATIONS ---
  const totalApps = applications.length;
  const approvedApps = applications.filter(a => a.status === 'approved' || (a.ir_decision === 'approve' && a.head_decision === 'approve')).length;
  const conflictApps = applications.filter(a => a.status === 'waiting_for_final_decision' || (a.ir_decision === 'approve' && a.head_decision === 'reject') || (a.ir_decision === 'reject' && a.head_decision === 'approve')).length;
  const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'waiting_for_head' || a.status === 'waiting_for_ir').length;
  const acceptanceRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;

  const totalMembers = profiles.filter(p => p.membership_status === 'active_member').length;
  const totalRegistrations = registrations.length;
  const attendedRegistrations = registrations.filter(r => r.status === 'attended').length;
  const attendanceRate = totalRegistrations > 0 ? Math.round((attendedRegistrations / totalRegistrations) * 100) : 0;

  const avgEvalScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length)
    : 0;

  // Unique evaluation months
  const evalMonths = Array.from(new Set(evaluations.map(e => e.evaluation_month))).filter(Boolean);

  // Committee breakdown
  const committeeAppsMap = committees.reduce((acc, c) => {
    acc[c.key] = applications.filter(a => a.committee_key === c.key).length;
    return acc;
  }, {} as Record<string, number>);

  // --- EXPORT HANDLERS ---
  const handleExportApplicants = () => {
    exportApplicantsCSV(applications, questions, selectedCommittee);
    showFeedback(language === 'ar' ? 'تم تصدير بيانات المتقدمين بصيغة CSV (Excel UTF-8 BOM) بنجاح!' : 'Applicants CSV exported successfully!');
  };

  const handleExportRegistrations = () => {
    exportEventRegistrationsCSV(registrations, events, selectedEventId);
    showFeedback(language === 'ar' ? 'تم تصدير سجلات حضور الفعاليات بنجاح!' : 'Event registrations exported successfully!');
  };

  const handleExportEvaluations = () => {
    exportEvaluationsCSV(evaluations, profiles, selectedMonth);
    showFeedback(language === 'ar' ? 'تم تصدير تقييمات الأعضاء الشهرية بنجاح!' : 'Member evaluations exported successfully!');
  };

  const handleExportMembersRoster = () => {
    exportMembersRosterCSV(profiles);
    showFeedback(language === 'ar' ? 'تم تصدير سجل أعضاء الفريق وتوزيع الـ IR بنجاح!' : 'Members roster exported successfully!');
  };

  const handleExportAuditLogs = () => {
    exportAuditLogsCSV(auditLogs);
    showFeedback(language === 'ar' ? 'تم تصدير سجل العمليات (Audit Logs) بنجاح!' : 'Audit logs exported successfully!');
  };

  const handleExportFullJSON = () => {
    const fullDataset = {
      exported_at: new Date().toISOString(),
      summary: {
        total_applicants: totalApps,
        approved_applicants: approvedApps,
        total_active_members: totalMembers,
        total_event_registrations: totalRegistrations,
        average_evaluation_score: avgEvalScore
      },
      applications,
      evaluations,
      events,
      event_registrations: registrations,
      team_profiles: profiles,
      questions,
      audit_logs: auditLogs,
      access_codes: accessCodes
    };
    downloadFile(JSON.stringify(fullDataset, null, 2), `aliens_complete_data_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    showFeedback(language === 'ar' ? 'تم تنزيل حزمة البيانات الكاملة (Full Dataset JSON) بنجاح!' : 'Full dataset JSON downloaded successfully!');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#07152b] via-[#091b36] to-[#040d1a] border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black tracking-wider uppercase">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              {language === 'ar' ? 'مركز تحليل البيانات والتصدير الشامل' : 'Data Analytics & Export Intelligence Hub'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'ar' ? 'تحليلات الأداء واستخراج ملفات الداتا' : 'Team Analytics & Dataset Extraction'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ar' 
                ? 'مساحة مخصصة لمسؤولي الداتا أناليسيز والقيادة لتوليد تقارير إحصائية دقيقة، وتنزيل ملفات Excel و CSV مدعومة باللغة العربية (UTF-8 BOM) لجميع طلبات التعيين، الفعاليات، التقييمات الشهرية، وسجلات الأعضاء.'
                : 'Dedicated workspace for Data Analysts and Leadership to generate real-time metrics, download clean Excel-ready UTF-8 CSV datasets for applicants, event attendance, monthly scorecards, and members rosters.'}
            </p>
          </div>

          {/* Quick Universal Export Button */}
          <button
            onClick={handleExportFullJSON}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>{language === 'ar' ? 'تصدير كامل قاعدة البيانات (JSON)' : 'Export Full Dataset (JSON)'}</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {exportFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-[#39ff14]/15 border border-[#39ff14]/30 text-[#39ff14] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{exportFeedback}</span>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Applicants Metric */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'المتقدمين للتعيين' : 'Total Applicants'}</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalApps}</span>
            <span className="text-xs text-emerald-400 font-bold">({acceptanceRate}% {language === 'ar' ? 'قبول' : 'accepted'})</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">{approvedApps} {language === 'ar' ? 'مقبول' : 'approved'}</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{conflictApps} {language === 'ar' ? 'خلاف/حسم' : 'conflict'}</span>
          </div>
        </div>

        {/* Active Team Members */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'أعضاء التيم الفعليين' : 'Active Members'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{totalMembers}</span>
            <span className="text-xs text-slate-400">/{profiles.length} {language === 'ar' ? 'حساب' : 'accounts'}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {committees.length} {language === 'ar' ? 'لجان متخصصة' : 'specialized committees'}
          </div>
        </div>

        {/* Event Registrations */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'تسجيلات الفعاليات' : 'Event Registrations'}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300">{totalRegistrations}</span>
            <span className="text-xs text-purple-400 font-bold">({events.length} {language === 'ar' ? 'فعالية' : 'events'})</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{attendedRegistrations} {language === 'ar' ? 'حضروا بالفعل' : 'attended'} ({attendanceRate}%)</span>
          </div>
        </div>

        {/* Average Evaluation */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'متوسط تقييمات الأداء' : 'Average Performance'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">{avgEvalScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {evaluations.length} {language === 'ar' ? 'تقييم مسجل' : 'evaluations logged'}
          </div>
        </div>
      </div>

      {/* Dataset Download Action Center */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>{language === 'ar' ? 'ملفات البيانات الجاهزة للتحميل (Excel & CSV)' : 'Downloadable Datasets (Excel & CSV)'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">UTF-8 BOM Encoded • Arabic Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Applicants & Answers */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-white">
                {language === 'ar' ? 'شيت المتقدمين والإجابات الكاملة' : 'Applicants & Dynamic Answers'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'يحتوي على بيانات المتقدمين، قرارات الـ IR ورؤساء اللجان، وملاحظاتهم، مع أعمدة مخصصة لكل سؤال وإجابته.'
                  : 'Full applicant profiles, dual IR and Head decisions, notes, and individual columns for all dynamic question answers.'}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">{language === 'ar' ? 'تصفية حسب اللجنة:' : 'Filter by Committee:'}</label>
                <select
                  value={selectedCommittee}
                  onChange={(e) => setSelectedCommittee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">{language === 'ar' ? 'جميع اللجان (All Committees)' : 'All Committees'}</option>
                  {committees.map(c => (
                    <option key={c.key} value={c.key}>{c.name_ar} ({c.name})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportApplicants}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحميل شيت المتقدمين (CSV)' : 'Download Applicants (CSV)'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Performance Evaluations */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-white">
                {language === 'ar' ? 'شيت التقييمات الشهرية ومعايير الأداء' : 'Monthly Performance Scorecards'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'تفصيل درجات المعايير الخمسة (الالتزام، المشاركة، جودة المهام، العمل الجماعي، التواصل) لكل عضو مع التوصيات والملاحظات.'
                  : '5-criteria performance scores breakdown (Attendance, Participation, Task Quality, Teamwork, Communication) with notes.'}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">{language === 'ar' ? 'تصفية حسب الشهر:' : 'Filter by Month:'}</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">{language === 'ar' ? 'جميع الشهور (All Months)' : 'All Months'}</option>
                  {evalMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportEvaluations}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحميل شيت التقييمات (CSV)' : 'Download Scorecards (CSV)'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Events & Registrations */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-white">
                {language === 'ar' ? 'شيت تسجيلات وحضور الفعاليات' : 'Events & Attendee Registrations'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'قوائم الحاضرين والمسجلين في ورش العمل والفعاليات مع أرقام الهواتف، الكليات، وحالة التأكيد والحضور.'
                  : 'Attendee rosters for events and workshops with contact details, academic level, and attendance confirmation.'}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">{language === 'ar' ? 'تصفية حسب الفعالية:' : 'Filter by Event:'}</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">{language === 'ar' ? 'جميع الفعاليات (All Events)' : 'All Events'}</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportRegistrations}
                className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحميل شيت الفعاليات (CSV)' : 'Download Registrations (CSV)'}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Team Members & IR Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-white">
                {language === 'ar' ? 'سجل أعضاء الفريق وتوزيع الـ IR' : 'Team Members & IR Distribution'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'قاعدة بيانات جميع الأعضاء، اللجان، المناصب، أكواد الترقية المستخدمة، وتوزيع إسناد أعضاء الـ IR.'
                  : 'Master roster of all members, roles, committees, access codes redeemed, and assigned IR evaluators.'}
              </p>
            </div>

            <button
              onClick={handleExportMembersRoster}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ar' ? 'تحميل سجل الأعضاء (CSV)' : 'Download Members Roster (CSV)'}</span>
            </button>
          </div>

          {/* Card 5: Audit Logs & Security History */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-white">
                {language === 'ar' ? 'سجل العمليات والأمان (Audit Logs)' : 'Audit Logs & Security Trail'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'سجل غير قابل للتعديل لجميع العمليات، التعديلات الإدارية، قرارات التعيين، وإصدار أكواد الدخول.'
                  : 'Immutable security log of all administrative actions, recruitment decisions, and code creations.'}
              </p>
            </div>

            <button
              onClick={handleExportAuditLogs}
              className="w-full py-2.5 rounded-xl bg-red-500/90 hover:bg-red-400 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ar' ? 'تحميل سجل العمليات (CSV)' : 'Download Audit Trail (CSV)'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Interactive Committee Demand Breakdown Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <span>{language === 'ar' ? 'توزيع إقبال المتقدمين حسب اللجان' : 'Applicants Distribution by Committee'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ar' ? 'نسبة الطلبات المقدمة لكل لجنة لتحليل توجهات واهتمامات المرشحين' : 'Application volume and share across specialized committees'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {committees.map(c => {
            const count = committeeAppsMap[c.key] || 0;
            const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
            return (
              <div key={c.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.name_ar}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({c.name})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-cyan-400 font-black">{count} {language === 'ar' ? 'طلب' : 'apps'}</span>
                    <span className="text-slate-500">({pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-[#39ff14] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
