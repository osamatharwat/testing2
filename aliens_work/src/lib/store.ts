import { 
  Profile, 
  AccessCode, 
  DynamicQuestion, 
  Application, 
  PerformanceEvaluation, 
  EventItem, 
  GalleryItem, 
  MemberProject, 
  Internship, 
  CulturalResource, 
  AuditLog, 
  SiteSettings, 
  EventRegistration, 
  CommitteeEntity, 
  DecisionChoice, 
  ApplicationOverallStatus, 
  GalleryComment,
  MemberWarning,
  CertificateRecord,
  EvaluationCriterion,
  WhatsAppTemplate,
  CommitteeKey,
  Role
} from '../types';

import { persistRemoteCollection, remoteKeyForStorage, persistProfile, persistApplication, deleteProfileRemote, persistEventRegistration, persistGalleryComment, toggleGalleryLikeRemote, persistMemory, persistMemoryComment, toggleMemoryLikeRemote, deleteMemoryRemote } from './remoteStore';

import {
  INITIAL_PROFILES,
  INITIAL_ACCESS_CODES,
  INITIAL_DYNAMIC_QUESTIONS,
  INITIAL_APPLICATIONS,
  INITIAL_EVALUATIONS,
  INITIAL_EVENTS,
  INITIAL_EVENT_REGISTRATIONS,
  INITIAL_GALLERY,
  INITIAL_MEMORIES,
  INITIAL_PROJECTS,
  INITIAL_INTERNSHIPS,
  INITIAL_CULTURAL_RESOURCES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_COMMITTEES
} from './seedData';

const STORAGE_KEYS = {
  PROFILES: 'aliens_profiles_v5',
  ACCESS_CODES: 'aliens_access_codes_v5',
  DYNAMIC_QUESTIONS: 'aliens_dynamic_questions_v5',
  APPLICATIONS: 'aliens_applications_v5',
  EVALUATIONS: 'aliens_evaluations_v5',
  EVENTS: 'aliens_events_v5',
  EVENT_REGISTRATIONS: 'aliens_event_registrations_v5',
  GALLERY: 'aliens_gallery_v5',
  MEMORIES: 'aliens_memories_v5',
  PROJECTS: 'aliens_projects_v5',
  INTERNSHIPS: 'aliens_internships_v5',
  CULTURAL: 'aliens_cultural_v5',
  AUDIT_LOGS: 'aliens_audit_logs_v5',
  SETTINGS: 'aliens_settings_v5',
  COMMITTEES: 'aliens_committees_v5',
  WARNINGS: 'aliens_warnings_v5',
  CERTIFICATES: 'aliens_certificates_v5',
  CURRENT_USER_ID: 'aliens_active_user_id_v5'
};

function getStorageItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function setStorageItem<T>(key: string, value: T, options?: { remote?: boolean }): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('aliens_store_change'));
    window.dispatchEvent(new Event('storage'));

    if (options?.remote !== false) {
      const remoteKey = remoteKeyForStorage(key);
      if (remoteKey) void persistRemoteCollection(remoteKey, value);
    }
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const AppStore = {
  // Profiles
  getProfiles(): Profile[] {
    return getStorageItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  },

  saveProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = { ...profile, updated_at: new Date().toISOString() };
    } else {
      profiles.push({ ...profile, created_at: new Date().toISOString() });
    }
    setStorageItem(STORAGE_KEYS.PROFILES, profiles, { remote: false });
    void persistProfile(profile);
    this.logAudit('PROFILE_UPDATED', profile.full_name, `Role: ${profile.role}, Comm: ${profile.committee || 'None'}`);
  },

  createProfile(profile: Omit<Profile, 'id' | 'created_at'>): Profile {
    const profiles = this.getProfiles();
    const newProfile: Profile = {
      ...profile,
      id: 'usr-' + Date.now(),
      created_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    setStorageItem(STORAGE_KEYS.PROFILES, profiles, { remote: false });
    void persistProfile(newProfile);
    this.logAudit('PROFILE_CREATED', newProfile.full_name, `Username: @${newProfile.username}, Role: ${newProfile.role}`);
    return newProfile;
  },

  /**
   * Assigns an active member to an IR Evaluator for monthly tracking
   * Enforces flexible IR quota from SiteSettings
   */
  assignIRMember(memberId: string, irEvaluatorId: string, actor: Profile): void {
    const profiles = this.getProfiles();
    const member = profiles.find(p => p.id === memberId);
    const irEvaluator = profiles.find(p => p.id === irEvaluatorId);

    if (!member) throw new Error('العضو المطلوب غير موجود.');
    if (!irEvaluator) throw new Error('مسؤول الـ IR غير موجود.');

    const maxLimit = this.getSettings().ir_max_members_limit || 30;

    const currentAssignedCount = profiles.filter(p => p.assigned_ir === irEvaluatorId && p.id !== memberId).length;
    if (currentAssignedCount >= maxLimit) {
      throw new Error(`تم الوصول للحد الأقصى لتوزيع الأعضاء على مسؤول الـ IR (${irEvaluator.full_name}) وهو ${maxLimit} عضواً.`);
    }

    member.assigned_ir = irEvaluatorId;
    setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    this.logAudit('IR_MEMBER_ASSIGNED', `${member.full_name} -> ${irEvaluator.full_name}`, `Assigned by: ${actor.full_name} (${actor.role})`);
  },

  deleteProfile(id: string): void {
    const profiles = this.getProfiles().filter(p => p.id !== id);
    setStorageItem(STORAGE_KEYS.PROFILES, profiles, { remote: false });
    void deleteProfileRemote(id);
    this.logAudit('PROFILE_DELETED', id, 'Deleted by administrator');
  },

  // Active User session
  getActiveUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-guest';
  },

  setActiveUserId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    window.dispatchEvent(new Event('storage'));
  },

  // Committees & Capacity Limits
  getCommittees(): CommitteeEntity[] {
    return getStorageItem<CommitteeEntity[]>(STORAGE_KEYS.COMMITTEES, INITIAL_COMMITTEES);
  },

  createCommittee(committee: Omit<CommitteeEntity, 'created_at'>): void {
    const list = this.getCommittees();
    list.push({ ...committee, created_at: new Date().toISOString() });
    setStorageItem(STORAGE_KEYS.COMMITTEES, list);
    this.logAudit('COMMITTEE_CREATED', committee.name, committee.key);
  },

  updateCommittee(key: string, updates: Partial<CommitteeEntity>): void {
    const list = this.getCommittees();
    const idx = list.findIndex(c => c.key === key);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      setStorageItem(STORAGE_KEYS.COMMITTEES, list);
      this.logAudit('COMMITTEE_UPDATED', key, JSON.stringify(updates));
    }
  },

  deleteCommittee(key: string): void {
    const list = this.getCommittees().filter(c => c.key !== key);
    setStorageItem(STORAGE_KEYS.COMMITTEES, list);
    this.logAudit('COMMITTEE_DELETED', key, 'Committee deleted by administrator');
  },

  // Access Codes
  getAccessCodes(): AccessCode[] {
    return getStorageItem<AccessCode[]>(STORAGE_KEYS.ACCESS_CODES, INITIAL_ACCESS_CODES);
  },

  createAccessCode(codeData: Omit<AccessCode, 'id' | 'current_uses' | 'created_at'>): AccessCode {
    const codes = this.getAccessCodes();
    const newCode: AccessCode = {
      ...codeData,
      id: 'code-' + Date.now(),
      current_uses: 0,
      created_at: new Date().toISOString()
    };
    codes.unshift(newCode);
    setStorageItem(STORAGE_KEYS.ACCESS_CODES, codes);
    this.logAudit('ACCESS_CODE_CREATED', newCode.code, `Committee: ${newCode.committee}, Role: ${newCode.role}`);
    return newCode;
  },

  validateAccessCode(codeStr: string): { valid: boolean; codeObj?: AccessCode; error?: string } {
    const normalized = codeStr.trim().toUpperCase();
    const codes = this.getAccessCodes();
    const found = codes.find(c => c.code.toUpperCase() === normalized);

    if (!found) {
      return { valid: false, error: 'كود الترقية / الانضمام غير صحيح' };
    }

    if (!found.is_active) {
      return { valid: false, error: 'هذا الكود تم إيقافه أو تعطيله من الإدارة' };
    }

    if (found.current_uses >= found.max_uses) {
      return { valid: false, error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكود' };
    }

    if (found.expires_at && new Date(found.expires_at) < new Date()) {
      return { valid: false, error: 'انتهت صلاحية هذا الكود' };
    }

    return { valid: true, codeObj: found };
  },

  redeemAccessCode(codeStr: string, memberProfile: Profile): { success: boolean; error?: string } {
    const validation = this.validateAccessCode(codeStr);
    if (!validation.valid || !validation.codeObj) {
      return { success: false, error: validation.error };
    }

    const codeObj = validation.codeObj;
    const codes = this.getAccessCodes();
    const idx = codes.findIndex(c => c.id === codeObj.id);
    if (idx >= 0) {
      codes[idx].current_uses += 1;
      if (codes[idx].single_use && codes[idx].current_uses >= codes[idx].max_uses) {
        codes[idx].is_active = false;
      }
      setStorageItem(STORAGE_KEYS.ACCESS_CODES, codes);
    }

    // Upgrade member
    memberProfile.committee = codeObj.committee;
    memberProfile.committee_key = codeObj.committee;
    memberProfile.position = codeObj.position;
    memberProfile.role = codeObj.role;
    memberProfile.membership_status = 'active_member';
    memberProfile.access_code_used = codeObj.code;

    this.saveProfile(memberProfile);
    this.logAudit('ACCESS_CODE_REDEEMED', codeObj.code, `User: ${memberProfile.full_name} promoted to ${codeObj.position}`);
    return { success: true };
  },

  deleteAccessCode(id: string): void {
    const codes = this.getAccessCodes().filter(c => c.id !== id);
    setStorageItem(STORAGE_KEYS.ACCESS_CODES, codes);
    this.logAudit('ACCESS_CODE_DELETED', id, 'Deleted by administrator');
  },

  addAccessCode(codeData: Omit<AccessCode, 'id' | 'current_uses' | 'created_at'>): AccessCode {
    return this.createAccessCode(codeData);
  },

  verifyAndRedeemCode(codeStr: string, memberId: string, _memberName: string): { valid: boolean; codeObj?: AccessCode; error?: string } {
    const validation = this.validateAccessCode(codeStr);
    if (!validation.valid || !validation.codeObj) return validation;
    const profile = this.getProfileById(memberId);
    if (!profile) return { valid: false, error: 'العضو غير موجود.' };
    const redemption = this.redeemAccessCode(codeStr, profile);
    return redemption.success ? { valid: true, codeObj: validation.codeObj } : { valid: false, error: redemption.error };
  },

  // Dynamic Interview Questions
  getDynamicQuestions(): DynamicQuestion[] {
    return getStorageItem<DynamicQuestion[]>(STORAGE_KEYS.DYNAMIC_QUESTIONS, INITIAL_DYNAMIC_QUESTIONS);
  },

  saveDynamicQuestion(q: DynamicQuestion): void {
    const questions = this.getDynamicQuestions();
    const index = questions.findIndex(item => item.id === q.id);
    if (index >= 0) {
      questions[index] = q;
    } else {
      questions.push(q);
    }
    setStorageItem(STORAGE_KEYS.DYNAMIC_QUESTIONS, questions);
    this.logAudit('QUESTION_UPDATED', q.question_text, `Category: ${q.category}`);
  },

  createDynamicQuestion(qData: Omit<DynamicQuestion, 'id' | 'created_at'>): DynamicQuestion {
    const questions = this.getDynamicQuestions();
    const newQ: DynamicQuestion = {
      ...qData,
      id: 'q-' + Date.now(),
      created_at: new Date().toISOString()
    };
    questions.push(newQ);
    setStorageItem(STORAGE_KEYS.DYNAMIC_QUESTIONS, questions);
    this.logAudit('QUESTION_ADDED', newQ.question_text, `Category: ${newQ.category}`);
    return newQ;
  },

  deleteDynamicQuestion(id: string): void {
    const questions = this.getDynamicQuestions().filter(q => q.id !== id);
    setStorageItem(STORAGE_KEYS.DYNAMIC_QUESTIONS, questions);
    this.logAudit('QUESTION_DELETED', id, 'Deleted by authorized user');
  },

  // Applications & Dual-Approval Workflow
  getApplications(): Application[] {
    return getStorageItem<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  },

  addApplication(appData: Omit<Application, 'id' | 'created_at' | 'status' | 'ir_decision' | 'head_decision'>): Application {
    const applications = this.getApplications();
    const newApp: Application = {
      ...appData,
      id: 'app-' + Date.now(),
      status: 'pending',
      ir_decision: 'pending',
      head_decision: 'pending',
      created_at: new Date().toISOString()
    };
    applications.unshift(newApp);
    setStorageItem(STORAGE_KEYS.APPLICATIONS, applications, { remote: false });
    void persistApplication(newApp);
    this.logAudit('APPLICATION_SUBMITTED', newApp.applicant_name, `Committee: ${newApp.committee_name}`);
    return newApp;
  },

  /**
   * Shifts / Reassigns an applicant to a new committee after interview
   */
  shiftApplicationCommittee(applicationId: string, newCommitteeKey: string, newCommitteeName: string, actor: Profile): void {
    const applications = this.getApplications();
    const target = applications.find(a => a.id === applicationId);
    if (!target) throw new Error('الطلب غير موجود');

    const oldComm = target.committee_name || target.committee_key;
    target.shifted_from_committee = target.committee_key;
    target.committee_key = newCommitteeKey;
    target.committee_name = newCommitteeName;
    target.updated_at = new Date().toISOString();

    setStorageItem(STORAGE_KEYS.APPLICATIONS, applications, { remote: false });
    void persistApplication(target);
    this.logAudit('APPLICATION_SHIFTED', target.applicant_name, `Shifted from ${oldComm} to ${newCommitteeName} by ${actor.full_name}`);
  },

  /**
   * Shifts / Reassigns an active member to a new committee
   */
  shiftMemberCommittee(memberId: string, newCommitteeKey: string, newPosition: string, actor: Profile): void {
    const profiles = this.getProfiles();
    const member = profiles.find(p => p.id === memberId);
    if (!member) throw new Error('العضو غير موجود');

    const oldComm = member.committee || 'General';
    member.committee = newCommitteeKey;
    member.committee_key = newCommitteeKey;
    member.position = newPosition || member.position;
    member.updated_at = new Date().toISOString();

    setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    this.logAudit('MEMBER_SHIFTED', member.full_name, `Shifted from ${oldComm} to ${newCommitteeKey} by ${actor.full_name}`);
  },

  /**
   * Dual-Approval Evaluation Logic:
   * IR + Committee Head (or Sub Head) must both approve.
   */
  evaluateApplication(
    applicationId: string,
    decision: DecisionChoice,
    decisionType: 'ir' | 'head',
    evaluator: Profile,
    notes?: string
  ): Application {
    const applications = this.getApplications();
    const target = applications.find(a => a.id === applicationId);
    if (!target) throw new Error('طلب التعيين غير موجود');

    const now = new Date().toISOString();

    if (decisionType === 'ir') {
      target.ir_decision = decision;
      target.ir_evaluator_id = evaluator.id;
      target.ir_evaluator_name = evaluator.full_name;
      target.ir_decision_note = notes || '';
      target.ir_decision_date = now;
    } else {
      target.head_decision = decision;
      target.head_evaluator_id = evaluator.id;
      target.head_evaluator_name = evaluator.full_name;
      target.head_decision_note = notes || '';
      target.head_decision_date = now;
    }

    target.updated_at = now;

    // Recalculate Overall Status
    const ir = target.ir_decision;
    const head = target.head_decision;

    if (ir === 'approve' && head === 'approve') {
      target.status = 'approved';
      this.autoPromoteApplicantToMember(target);
    } else if (ir === 'reject' && head === 'reject') {
      target.status = 'rejected';
    } else if ((ir === 'approve' && head === 'reject') || (ir === 'reject' && head === 'approve')) {
      target.status = 'waiting_for_final_decision';
    } else if (ir === 'pending' && head !== 'pending') {
      target.status = 'waiting_for_ir';
    } else if (head === 'pending' && ir !== 'pending') {
      target.status = 'waiting_for_head';
    } else {
      target.status = 'pending';
    }

    setStorageItem(STORAGE_KEYS.APPLICATIONS, applications, { remote: false });
    void persistApplication(target);
    this.logAudit('APPLICATION_EVALUATED', target.applicant_name, `${decisionType.toUpperCase()} Decision: ${decision.toUpperCase()} by ${evaluator.full_name}`);
    return target;
  },

  submitApplicationDualDecision(
    applicationId: string,
    decision: DecisionChoice,
    role: 'ir' | 'head',
    evaluator: Profile,
    notes?: string
  ): { app: Application; autoApproved: boolean } {
    const app = this.evaluateApplication(applicationId, decision, role, evaluator, notes);
    return { app, autoApproved: app.status === 'approved' };
  },

  overrideApplicationDecision(
    applicationId: string,
    finalStatus: 'approved' | 'rejected',
    actor: Profile,
    notes?: string
  ): Application {
    const applications = this.getApplications();
    const target = applications.find(a => a.id === applicationId);
    if (!target) throw new Error('طلب التعيين غير موجود');

    target.status = finalStatus;
    target.final_decision_by = actor.full_name;
    target.final_decision_role = actor.role;
    target.final_decision_note = notes || `Decision overridden by ${actor.role}`;
    target.final_decision_date = new Date().toISOString();
    target.updated_at = new Date().toISOString();

    if (finalStatus === 'approved') {
      this.autoPromoteApplicantToMember(target);
    }

    setStorageItem(STORAGE_KEYS.APPLICATIONS, applications, { remote: false });
    void persistApplication(target);
    this.logAudit('APPLICATION_OVERRIDE', target.applicant_name, `Final status overridden to ${finalStatus} by ${actor.full_name}`);
    return target;
  },

  autoPromoteApplicantToMember(application: Application): void {
    const profiles = this.getProfiles();
    const existing = profiles.find(p => p.phone === application.phone || p.full_name.toLowerCase() === application.applicant_name.toLowerCase());
    
    if (existing) {
      existing.membership_status = 'active_member';
      existing.role = 'member';
      existing.committee = application.committee_key;
      existing.committee_key = application.committee_key;
      existing.position = application.role_requested || 'Active Member';
      existing.faculty_level = application.faculty_level;
      this.saveProfile(existing);
    } else {
      const generatedUsername = application.applicant_name.replace(/\s+/g, '_').toLowerCase() + Math.floor(100 + Math.random() * 900);
      const newMember: Profile = {
        id: 'usr-promoted-' + Date.now(),
        email: `${generatedUsername}@delta.edu.eg`,
        username: generatedUsername,
        full_name: application.applicant_name,
        role: 'member',
        position: application.role_requested || 'Active Member',
        committee: application.committee_key,
        committee_key: application.committee_key,
        committee_position: 'Member',
        membership_status: 'active_member',
        is_board_member: false,
        phone: application.phone,
        faculty_level: application.faculty_level,
        created_at: new Date().toISOString()
      };
      profiles.push(newMember);
      setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    }
  },

  deleteApplication(id: string): void {
    const applications = this.getApplications().filter(a => a.id !== id);
    setStorageItem(STORAGE_KEYS.APPLICATIONS, applications);
    this.logAudit('APPLICATION_DELETED', id, 'Deleted by administrator');
  },

  // Monthly Performance Evaluations
  getEvaluations(): PerformanceEvaluation[] {
    return getStorageItem<PerformanceEvaluation[]>(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
  },

  submitEvaluation(evalData: Omit<PerformanceEvaluation, 'id' | 'created_at'>): PerformanceEvaluation {
    const evals = this.getEvaluations();
    const newEval: PerformanceEvaluation = {
      ...evalData,
      id: 'eval-' + Date.now(),
      created_at: new Date().toISOString()
    };
    evals.push(newEval);
    setStorageItem(STORAGE_KEYS.EVALUATIONS, evals);
    this.logAudit('EVALUATION_SUBMITTED', newEval.member_name, `Score: ${newEval.score}/100 for Month: ${newEval.evaluation_month} by ${newEval.evaluator_name}`);
    
    // Auto-check warnings
    this.autoCheckMemberWarnings(newEval.member_id, newEval.member_name);

    return newEval;
  },

  // Warnings & Strikes System
  getMemberWarnings(): MemberWarning[] {
    return getStorageItem<MemberWarning[]>(STORAGE_KEYS.WARNINGS, []);
  },

  createMemberWarning(warning: Omit<MemberWarning, 'id' | 'issued_at' | 'is_active'>): MemberWarning {
    const warnings = this.getMemberWarnings();
    const newWarning: MemberWarning = {
      ...warning,
      id: 'warn-' + Date.now(),
      issued_at: new Date().toISOString(),
      is_active: true
    };
    warnings.unshift(newWarning);
    setStorageItem(STORAGE_KEYS.WARNINGS, warnings);
    this.logAudit('MEMBER_WARNING_ISSUED', newWarning.member_name, `Level: ${newWarning.level}, Reason: ${newWarning.reason}`);
    return newWarning;
  },

  clearMemberWarning(warningId: string, clearedBy: Profile): void {
    const warnings = this.getMemberWarnings();
    const target = warnings.find(w => w.id === warningId);
    if (target) {
      target.is_active = false;
      target.cleared_at = new Date().toISOString();
      target.cleared_by = clearedBy.full_name;
      setStorageItem(STORAGE_KEYS.WARNINGS, warnings);
      this.logAudit('MEMBER_WARNING_CLEARED', target.member_name, `Cleared by: ${clearedBy.full_name}`);
    }
  },

  issueWarning(data: {
    member_id: string;
    member_name: string;
    member_committee?: CommitteeKey;
    warning_type?: 'verbal' | 'written' | 'final_strike';
    reason: string;
    issued_by_id?: string;
    issued_by_name: string;
    issued_by_role?: Role;
  }): MemberWarning {
    const existing = this.getMemberWarnings().filter(w => w.member_id === data.member_id && w.is_active);
    const level: MemberWarning['level'] = existing.length === 0 ? 'first_warning' : existing.length === 1 ? 'second_warning' : 'final_warning';
    return this.createMemberWarning({
      member_id: data.member_id,
      member_name: data.member_name,
      reason: data.reason,
      level,
      consecutive_months_low: 0,
      issued_by_name: data.issued_by_name,
      member_committee: data.member_committee,
      warning_type: data.warning_type,
      issued_by_id: data.issued_by_id,
      issued_by_role: data.issued_by_role
    });
  },

  resolveWarning(warningId: string): void {
    const activeId = this.getActiveUserId();
    const actor = this.getProfileById(activeId) || this.getProfiles()[0];
    if (actor) this.clearMemberWarning(warningId, actor);
  },

  /**
   * Automatically checks member evaluation scores against threshold and consecutive months
   */
  autoCheckMemberWarnings(memberId: string, memberName: string): void {
    const settings = this.getSettings();
    const threshold = settings.warning_threshold || 60;
    const requiredConsecutive = settings.warning_consecutive_months || 2;

    const evals = this.getEvaluations().filter(e => e.member_id === memberId);
    if (evals.length < requiredConsecutive) return;

    // Check last N evals
    const lastNEvals = evals.slice(-requiredConsecutive);
    const allLow = lastNEvals.every(e => (e.score || 0) < threshold);

    if (allLow) {
      const activeWarnings = this.getMemberWarnings().filter(w => w.member_id === memberId && w.is_active);
      const level = activeWarnings.length === 0 ? 'first_warning' : activeWarnings.length === 1 ? 'second_warning' : 'final_warning';

      this.createMemberWarning({
        member_id: memberId,
        member_name: memberName,
        reason: `انخفاض التقييم الشهري عن ${threshold}% لعدد ${requiredConsecutive} أشهر متتالية.`,
        level,
        consecutive_months_low: requiredConsecutive,
        issued_by_name: 'نظام الرقابة الآلي (Aliens Sentinel)'
      });
    }
  },

  // Events & QR Tickets
  getEvents(): EventItem[] {
    return getStorageItem<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },

  createEvent(eventData: Omit<EventItem, 'id' | 'created_at'>): EventItem {
    const events = this.getEvents();
    const newEvent: EventItem = {
      ...eventData,
      id: 'event-' + Date.now(),
      created_at: new Date().toISOString()
    };
    events.unshift(newEvent);
    setStorageItem(STORAGE_KEYS.EVENTS, events);
    this.logAudit('EVENT_CREATED', newEvent.title, `Category: ${newEvent.category}`);
    return newEvent;
  },

  updateEvent(id: string, updates: Partial<EventItem>): void {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx >= 0) {
      events[idx] = { ...events[idx], ...updates };
      setStorageItem(STORAGE_KEYS.EVENTS, events);
      this.logAudit('EVENT_UPDATED', events[idx].title, JSON.stringify(updates));
    }
  },

  deleteEvent(id: string): void {
    const events = this.getEvents().filter(e => e.id !== id);
    setStorageItem(STORAGE_KEYS.EVENTS, events);
    this.logAudit('EVENT_DELETED', id, 'Deleted by administrator');
  },

  // Event Registrations & QR Tickets
  getEventRegistrations(): EventRegistration[] {
    return getStorageItem<EventRegistration[]>(STORAGE_KEYS.EVENT_REGISTRATIONS, INITIAL_EVENT_REGISTRATIONS);
  },

  registerForEvent(regData: Omit<EventRegistration, 'id' | 'registered_at' | 'status' | 'ticket_code'>): EventRegistration {
    const all = this.getEventRegistrations();
    const ticketCode = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
    
    const newReg: EventRegistration = {
      ...regData,
      id: 'reg-' + Date.now(),
      ticket_code: ticketCode,
      registered_at: new Date().toISOString(),
      status: 'confirmed'
    };
    all.unshift(newReg);
    setStorageItem(STORAGE_KEYS.EVENT_REGISTRATIONS, all, { remote: false });
    void persistEventRegistration(newReg);
    this.logAudit('EVENT_REGISTRATION', newReg.full_name, `Registered for: ${newReg.event_title} [Ticket: ${ticketCode}]`);
    return newReg;
  },

  updateRegistrationStatus(id: string, status: 'confirmed' | 'attended' | 'cancelled'): void {
    const all = this.getEventRegistrations();
    const idx = all.findIndex(r => r.id === id);
    if (idx >= 0) {
      all[idx].status = status;
      setStorageItem(STORAGE_KEYS.EVENT_REGISTRATIONS, all);
    }
  },

  // Certificates
  getCertificates(): CertificateRecord[] {
    return getStorageItem<CertificateRecord[]>(STORAGE_KEYS.CERTIFICATES, []);
  },

  issueCertificate(cert: Omit<CertificateRecord, 'id' | 'issued_at' | 'verification_code'>): CertificateRecord {
    const certs = this.getCertificates();
    const code = 'CERT-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Date.now().toString().slice(-4);
    const newCert: CertificateRecord = {
      ...cert,
      id: 'cert-' + Date.now(),
      verification_code: code,
      issued_at: new Date().toISOString()
    };
    certs.unshift(newCert);
    setStorageItem(STORAGE_KEYS.CERTIFICATES, certs);
    this.logAudit('CERTIFICATE_ISSUED', newCert.recipient_name, `Event: ${newCert.event_title} [Code: ${code}]`);
    return newCert;
  },

  // Gallery
  getGallery(): GalleryItem[] {
    return getStorageItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
  },

  createGalleryItem(data: Partial<GalleryItem>): GalleryItem {
    const gallery = this.getGallery();
    const newImg: GalleryItem = {
      id: 'gal-' + Date.now(),
      section_name: data.section_name || 'عام / General',
      image_url: data.image_url || '',
      title: data.title,
      description: data.description,
      caption: data.caption || data.description,
      tag: data.tag || 'Aliens',
      created_by: data.created_by,
      likes_count: 0,
      liked_by_users: [],
      comments: [],
      created_at: new Date().toISOString()
    };
    gallery.unshift(newImg);
    setStorageItem(STORAGE_KEYS.GALLERY, gallery);
    this.logAudit('GALLERY_PHOTO_ADDED', newImg.title || 'Untitled', `Section: ${newImg.section_name}`);
    return newImg;
  },

  deleteGalleryItem(id: string): void {
    const gallery = this.getGallery().filter(g => g.id !== id);
    setStorageItem(STORAGE_KEYS.GALLERY, gallery);
    this.logAudit('GALLERY_PHOTO_DELETED', id, 'Deleted by administrator');
  },

  addGalleryComment(galleryId: string, author: Profile, text: string): GalleryComment {
    const gallery = this.getGallery();
    const target = gallery.find(g => g.id === galleryId);
    if (!target) throw new Error('الصورة غير موجودة');

    const newComment: GalleryComment = {
      id: 'comm-' + Date.now(),
      gallery_id: galleryId,
      user_id: author.id,
      user_name: author.full_name,
      user_avatar: author.avatar_url,
      user_role: author.role,
      comment_text: text,
      created_at: new Date().toISOString()
    };

    target.comments.push(newComment);
    setStorageItem(STORAGE_KEYS.GALLERY, gallery, { remote: false });
    void persistGalleryComment(newComment);
    return newComment;
  },

  toggleGalleryLike(id: string, userId: string): void {
    const gallery = this.getGallery();
    const target = gallery.find(g => g.id === id);
    if (!target) return;
    const idx = target.liked_by_users.indexOf(userId);
    if (idx >= 0) {
      target.liked_by_users.splice(idx, 1);
      target.likes_count = Math.max(0, target.likes_count - 1);
    } else {
      target.liked_by_users.push(userId);
      target.likes_count += 1;
    }
    setStorageItem(STORAGE_KEYS.GALLERY, gallery, { remote: false });
    void toggleGalleryLikeRemote(id, userId);
  },

  // Memories
  getMemories(): any[] {
    return getStorageItem<any[]>(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);
  },

  addMemory(author: Profile, text: string, imageUrl?: string): any {
    const memories = this.getMemories();
    const newMemory = {
      id: 'mem-' + Date.now(),
      user_id: author.id,
      author_name: author.full_name,
      author_avatar: author.avatar_url,
      author_committee: author.committee,
      memory_text: text,
      image_url: imageUrl,
      likes_count: 0,
      liked_by_me: false,
      liked_by_users: [],
      comments: [],
      created_at: new Date().toISOString()
    };
    memories.unshift(newMemory);
    setStorageItem(STORAGE_KEYS.MEMORIES, memories, { remote: false });
    void persistMemory(newMemory);
    return newMemory;
  },

  addMemoryPost(author: Profile, text: string, imageUrl?: string): any {
    return this.addMemory(author, text, imageUrl);
  },

  toggleMemoryLike(id: string, userId: string): void {
    const memories = this.getMemories();
    const target = memories.find((m: any) => m.id === id);
    if (target) {
      target.liked_by_me = !target.liked_by_me;
      target.likes_count += target.liked_by_me ? 1 : -1;
      setStorageItem(STORAGE_KEYS.MEMORIES, memories, { remote: false });
      void toggleMemoryLikeRemote(id, userId);
    }
  },

  addMemoryComment(memoryId: string, author: Profile, text: string): void {
    const memories = this.getMemories();
    const target = memories.find((m: any) => m.id === memoryId);
    if (target) {
      target.comments.push({
        id: 'c-' + Date.now(),
        memory_id: memoryId,
        user_id: author.id,
        author_name: author.full_name,
        comment_text: text,
        created_at: new Date().toISOString()
      });
      setStorageItem(STORAGE_KEYS.MEMORIES, memories, { remote: false });
      void persistMemoryComment({ ...target.comments[target.comments.length - 1], memory_id: memoryId });
    }
  },

  deleteMemory(id: string): void {
    const memories = this.getMemories().filter((m: any) => m.id !== id);
    setStorageItem(STORAGE_KEYS.MEMORIES, memories, { remote: false });
    void deleteMemoryRemote(id);
  },

  // Projects, Internships, Cultural Resources
  getProjects(): MemberProject[] {
    return getStorageItem<MemberProject[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },

  getInternships(): Internship[] {
    return getStorageItem<Internship[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
  },

  getCulturalResources(): CulturalResource[] {
    return getStorageItem<CulturalResource[]>(STORAGE_KEYS.CULTURAL, INITIAL_CULTURAL_RESOURCES);
  },

  getCulturalPosts(): CulturalResource[] {
    return this.getCulturalResources();
  },

  // Settings & CMS
  getSettings(): SiteSettings {
    return getStorageItem<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings(updates: Partial<SiteSettings>): void {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    setStorageItem(STORAGE_KEYS.SETTINGS, updated);
    this.logAudit('SETTINGS_UPDATED', 'Site CMS & Matrix', JSON.stringify(updates));
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  logAudit(action: string, target: string, details?: string): void {
    const logs = this.getAuditLogs();
    const activeUserId = this.getActiveUserId();
    const profiles = this.getProfiles();
    const actor = profiles.find(p => p.id === activeUserId);

    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      actor_id: activeUserId,
      actor_name: actor ? actor.full_name : 'System Admin',
      action,
      target,
      new_value: details || '',
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // CSV Exporter
  exportToCSV(filename: string, rows: Record<string, any>[]): void {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(header => {
          const val = row[header] === undefined || row[header] === null ? '' : String(row[header]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
