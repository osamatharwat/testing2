import { Application, DynamicQuestion, EventRegistration, EventItem, PerformanceEvaluation, Profile, AuditLog, AccessCode } from '../types';

/**
 * Utility to download a file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field safely
 */
function escapeCSV(val: any): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Applicants to CSV with Full Arabic UTF-8 BOM support and dynamic question answers
 */
export function exportApplicantsCSV(
  applications: Application[], 
  questions: DynamicQuestion[] = [], 
  filterCommittee?: string
): void {
  const filtered = filterCommittee && filterCommittee !== 'all' 
    ? applications.filter(a => a.committee_key === filterCommittee)
    : applications;

  // Header row
  const headers = [
    'Application ID / كود الطلب',
    'Full Name / الاسم ثلاثي',
    'Phone / رقم الهاتف',
    'Faculty & Level / الكلية والفرقة',
    'Target Committee / اللجنة المتقدم لها',
    'Requested Role / المنصب المطلوب',
    'Overall Status / الحالة العامة',
    'IR Decision / قرار الـ IR',
    'IR Evaluator / مقيم الـ IR',
    'IR Notes / ملاحظات الـ IR',
    'IR Decision Date / تاريخ قرار الـ IR',
    'Head Decision / قرار رئيس اللجنة',
    'Head Evaluator / مقيم رئيس اللجنة',
    'Head Notes / ملاحظات رئيس اللجنة',
    'Head Decision Date / تاريخ قرار رئيس اللجنة',
    'Final Decision By / حسم بواسطة (OG)',
    'Final Notes / ملاحظات الحسم النهائي',
    'Submission Date / تاريخ التقديم'
  ];

  // Add question columns
  const questionMap: Record<string, string> = {};
  questions.forEach(q => {
    questionMap[q.id] = q.question_text;
    headers.push(`[Q: ${q.category}] ${q.question_text}`);
  });

  const rows = filtered.map(app => {
    const row = [
      escapeCSV(app.id),
      escapeCSV(app.applicant_name),
      escapeCSV(app.phone),
      escapeCSV(app.faculty_level),
      escapeCSV(app.committee_name || app.committee_key),
      escapeCSV(app.role_requested),
      escapeCSV(app.status),
      escapeCSV(app.ir_decision),
      escapeCSV(app.ir_evaluator_name || ''),
      escapeCSV(app.ir_decision_note || ''),
      escapeCSV(app.ir_decision_date || ''),
      escapeCSV(app.head_decision),
      escapeCSV(app.head_evaluator_name || ''),
      escapeCSV(app.head_decision_note || ''),
      escapeCSV(app.head_decision_date || ''),
      escapeCSV(app.final_decision_by || ''),
      escapeCSV(app.final_decision_note || ''),
      escapeCSV(app.created_at)
    ];

    // Append dynamic answers
    questions.forEach(q => {
      const answer = app.dynamic_answers ? app.dynamic_answers[q.id] || '' : '';
      row.push(escapeCSV(answer));
    });

    return row.join(',');
  });

  // Prepend UTF-8 BOM for Microsoft Excel / Arabic support
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `aliens_applicants_data_${dateStr}.csv`);
}

/**
 * Export Event Registrations to CSV
 */
export function exportEventRegistrationsCSV(
  registrations: EventRegistration[], 
  events: EventItem[] = [],
  filterEventId?: string
): void {
  const filtered = filterEventId && filterEventId !== 'all'
    ? registrations.filter(r => r.event_id === filterEventId)
    : registrations;

  const eventTitleMap = events.reduce((acc, ev) => {
    acc[ev.id] = ev.title;
    return acc;
  }, {} as Record<string, string>);

  const headers = [
    'Registration ID / كود التسجيل',
    'Event ID / كود الفعالية',
    'Event Title / عنوان الفعالية',
    'Attendee Name / اسم المسجل',
    'Phone / رقم الهاتف',
    'Email / البريد الإلكتروني',
    'Faculty & Academic Level / الكلية والفرقة',
    'Student ID / الكارنيه الجامعي',
    'Registration Status / حالة الحضور',
    'Registered At / تاريخ التسجيل',
    'Notes / ملاحظات'
  ];

  const rows = filtered.map(reg => [
    escapeCSV(reg.id),
    escapeCSV(reg.event_id),
    escapeCSV(reg.event_title || eventTitleMap[reg.event_id] || 'Unknown'),
    escapeCSV(reg.full_name),
    escapeCSV(reg.phone),
    escapeCSV(reg.email),
    escapeCSV(reg.faculty_level),
    escapeCSV(reg.student_id || ''),
    escapeCSV(reg.status),
    escapeCSV(reg.registered_at),
    escapeCSV(reg.notes || '')
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `aliens_event_registrations_${dateStr}.csv`);
}

/**
 * Export Member Monthly Evaluations to CSV
 */
export function exportEvaluationsCSV(
  evaluations: PerformanceEvaluation[], 
  profiles: Profile[] = [],
  filterMonth?: string
): void {
  const filtered = filterMonth && filterMonth !== 'all'
    ? evaluations.filter(e => e.evaluation_month === filterMonth)
    : evaluations;

  const profileMap = profiles.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, Profile>);

  const headers = [
    'Evaluation ID / كود التقييم',
    'Member ID / كود العضو',
    'Member Name / اسم العضو',
    'Committee / اللجنة',
    'Evaluator Name / اسم المقيم',
    'Evaluator Role / دور المقيم',
    'Evaluation Month / شهر التقييم',
    'Total Score (100) / الدرجة الإجمالية',
    'Attendance (20) / الحضور والالتزام',
    'Participation (20) / المشاركة والتفاعل',
    'Task Quality (20) / جودة المهام',
    'Teamwork (20) / العمل الجماعي',
    'Communication (20) / التواصل واللباقة',
    'Recommendation / التوصية',
    'Evaluator Notes / ملاحظات المقيم',
    'Submitted At / تاريخ التقييم'
  ];

  const rows = filtered.map(ev => {
    const member = profileMap[ev.member_id];
    return [
      escapeCSV(ev.id),
      escapeCSV(ev.member_id),
      escapeCSV(ev.member_name || member?.full_name || 'Unknown'),
      escapeCSV(ev.member_committee || member?.committee || ''),
      escapeCSV(ev.evaluator_name),
      escapeCSV(ev.evaluator_role),
      escapeCSV(ev.evaluation_month),
      escapeCSV(ev.score),
      escapeCSV(ev.criteria_scores?.attendance ?? ''),
      escapeCSV(ev.criteria_scores?.participation ?? ''),
      escapeCSV(ev.criteria_scores?.tasks_quality ?? ''),
      escapeCSV(ev.criteria_scores?.teamwork ?? ''),
      escapeCSV(ev.criteria_scores?.communication ?? ''),
      escapeCSV(ev.recommendation || ''),
      escapeCSV(ev.notes || ''),
      escapeCSV(ev.created_at)
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `aliens_evaluations_report_${dateStr}.csv`);
}

/**
 * Export Team Members Roster to CSV
 */
export function exportMembersRosterCSV(profiles: Profile[]): void {
  const headers = [
    'Member ID / كود العضو',
    'Full Name / الاسم بالكامل',
    'Username / اسم المستخدم',
    'Email / البريد الإلكتروني',
    'Phone / رقم الهاتف',
    'Role / الدور القيادي',
    'Position / المسمى الوظيفي',
    'Committee / اللجنة',
    'Membership Status / حالة العضوية',
    'Is Board Member / عضو مجلس إدارة',
    'Assigned IR ID / كود مسؤول IR المكلف',
    'Access Code Used / كود الانضمام المستخدم',
    'Faculty Level / الكلية والفرقة',
    'Created At / تاريخ الانضمام'
  ];

  const rows = profiles.map(p => [
    escapeCSV(p.id),
    escapeCSV(p.full_name),
    escapeCSV(p.username),
    escapeCSV(p.email),
    escapeCSV(p.phone || ''),
    escapeCSV(p.role),
    escapeCSV(p.position),
    escapeCSV(p.committee || p.committee_key || ''),
    escapeCSV(p.membership_status),
    escapeCSV(p.is_board_member ? 'Yes / نعم' : 'No / لا'),
    escapeCSV(p.assigned_ir || ''),
    escapeCSV(p.access_code_used || ''),
    escapeCSV(p.faculty_level || ''),
    escapeCSV(p.created_at)
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `aliens_members_roster_${dateStr}.csv`);
}

/**
 * Export Full System Audit Logs to CSV
 */
export function exportAuditLogsCSV(auditLogs: AuditLog[]): void {
  const headers = [
    'Log ID / كود السجل',
    'Actor / المنفذ',
    'Action Type / نوع العملية',
    'Target / الهدف',
    'Previous Value / القيمة السابقة',
    'New Value / القيمة الجديدة',
    'Timestamp / التوقيت'
  ];

  const rows = auditLogs.map(log => [
    escapeCSV(log.id),
    escapeCSV(log.actor_name),
    escapeCSV(log.action),
    escapeCSV(log.target),
    escapeCSV(log.previous_value || ''),
    escapeCSV(log.new_value || ''),
    escapeCSV(log.timestamp)
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `aliens_audit_logs_${dateStr}.csv`);
}
