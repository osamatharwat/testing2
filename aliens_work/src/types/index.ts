export type Role = 'guest' | 'member' | 'sub_head' | 'head' | 'ir' | 'team_sub_head' | 'team_head' | 'og';

export type MembershipStatus = 'guest' | 'registered' | 'pending' | 'active_member' | 'suspended' | 'alumni';

export type CommitteeKey = 
  | 'marketing' 
  | 'media' 
  | 'pr' 
  | 'ir' 
  | 'magic_hand' 
  | 'charity' 
  | 'secretary' 
  | 'event_planning'
  | 'leadership'
  | string; // Dynamic committee creation by OG

export interface CommitteeEntity {
  key: string;
  name: string;
  name_ar: string;
  tag: string;
  description: string;
  head_id?: string | null;
  sub_head_id?: string | null;
  capacity_limit?: number; // Flexible capacity limit per committee
  is_recruitment_open?: boolean;
  tasks: string[];
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  position: string;
  committee: CommitteeKey | '';
  committee_key?: CommitteeKey | '';
  committee_position?: string;
  membership_status: MembershipStatus;
  is_board_member: boolean;
  assigned_ir?: string | null; // ID of the IR evaluator responsible for this member
  created_at: string;
  updated_at?: string;
  bio?: string;
  phone?: string;
  faculty_level?: string;
  student_id?: string;
  access_code_used?: string;
}

export interface AccessCode {
  id: string;
  code: string;
  committee: CommitteeKey;
  position: 'Member' | 'Sub Head' | 'Head' | 'Board Member' | 'Leader';
  role: Role;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  single_use: boolean;
  expires_at?: string | null;
  created_by?: string;
  created_at: string;
  notes?: string;
}

export type QuestionCategory = 'global' | 'committee' | 'ir';

export interface DynamicQuestion {
  id: string;
  category: QuestionCategory;
  committee_key?: CommitteeKey;
  question_text: string;
  question_type: 'text' | 'textarea' | 'select' | 'radio';
  options?: string[];
  is_required: boolean;
  order_index: number;
  created_by_id?: string;
  created_by_name?: string;
  created_at: string;
}

export type DecisionChoice = 'pending' | 'approve' | 'reject';

export type ApplicationOverallStatus = 
  | 'new'
  | 'pending'
  | 'waiting_for_head'
  | 'waiting_for_ir'
  | 'waiting_for_final_decision' // Conflict state: one approved, one rejected
  | 'approved'
  | 'rejected';

export interface Application {
  id: string;
  applicant_name: string;
  phone: string;
  faculty_level: string;
  committee_key: CommitteeKey;
  committee_name: string;
  dynamic_answers: Record<string, string>;
  role_requested: string;
  status: ApplicationOverallStatus;
  shifted_from_committee?: string; // If shifted/reassigned after interview
  
  // Dual-Approval Workflow Fields:
  ir_decision: DecisionChoice;
  ir_evaluator_id?: string | null;
  ir_evaluator_name?: string;
  ir_decision_note?: string;
  ir_decision_date?: string;

  head_decision: DecisionChoice;
  head_evaluator_id?: string | null;
  head_evaluator_name?: string;
  head_decision_note?: string;
  head_decision_date?: string;

  // Final override by OG/Leadership if conflict occurs
  final_decision_by?: string;
  final_decision_role?: string;
  final_decision_note?: string;
  final_decision_date?: string;

  created_at: string;
  updated_at?: string;
}

export interface EvaluationCriterion {
  key?: string;
  label_ar?: string;
  label_en?: string;
  max_points: number;
  description_ar?: string;
  // Backward-compatible editor fields used by the admin CMS.
  id?: string;
  label?: string;
  description?: string;
}

export interface PerformanceEvaluation {
  id: string;
  member_id: string;
  member_name: string;
  member_committee: CommitteeKey;
  evaluator_id: string;
  evaluator_name: string;
  evaluator_role: Role;
  evaluation_month: string; // YYYY-MM
  score: number; // 0 - 100
  criteria_scores?: Record<string, number>;
  notes: string;
  recommendation?: string;
  created_at: string;
  updated_at?: string;
}

export interface WarningConfig {
  enabled: boolean;
  scoreThreshold: number; // e.g. 60
  consecutiveMonths: number; // e.g. 1, 2, 3, 6
  warningAction: 'flag' | 'suspend' | 'review';
}

export interface MemberWarning {
  id: string;
  member_id: string;
  member_name: string;
  reason: string;
  level: 'first_warning' | 'second_warning' | 'final_warning';
  consecutive_months_low: number;
  issued_by_name: string;
  issued_at: string;
  is_active: boolean;
  cleared_at?: string;
  cleared_by?: string;
  // Legacy/admin display fields.
  member_committee?: CommitteeKey;
  warning_type?: 'verbal' | 'written' | 'final_strike';
  issued_by_id?: string;
  issued_by_role?: Role;
}

export interface WhatsAppTemplate {
  id: string;
  key?: 'interview_invitation' | 'acceptance' | 'rejection' | 'ir_checkin' | 'task_reminder' | 'custom';
  title_ar?: string;
  message_template?: string;
  // Backward-compatible CMS fields.
  title?: string;
  category?: string;
  message?: string;
}

export interface EventWhatsAppGroup {
  id: string;
  title: string;
  link: string;
  max_members?: number;
  current_members?: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  image_url?: string;
  speaker?: string;
  action_link?: string;
  whatsapp_groups: EventWhatsAppGroup[];
  whatsapp_group?: string; // Backward-compatibility
  committee_key?: CommitteeKey | 'all';
  category: 'educational' | 'job_fair' | 'charity' | 'social' | 'workshop' | 'academic' | 'cultural' | 'community';
  is_public?: boolean;
  is_paid?: boolean;
  ticket_price?: number;
  certificate_enabled?: boolean;
  certificate_template_url?: string;
  max_attendees?: number;
  registration_count?: number;
  created_by_id?: string;
  created_by_name?: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  event_title: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  faculty_level: string;
  student_id?: string;
  ticket_code: string; // Unique QR ticket code e.g. TKT-2026-XXXX
  ticket_tier?: 'Free' | 'VIP' | 'Standard Paid';
  price_paid?: number;
  registered_at: string;
  status: 'confirmed' | 'attended' | 'cancelled';
  notes?: string;
}

export interface CertificateRecord {
  id: string;
  event_id: string;
  event_title: string;
  user_id?: string;
  recipient_name: string;
  recipient_email?: string;
  verification_code: string;
  issued_at: string;
  template_url?: string;
}

export interface GalleryComment {
  id: string;
  gallery_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_role: Role;
  comment_text: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  section_name: string;
  image_url: string;
  title?: string;
  description?: string;
  caption?: string;
  tag?: string;
  created_by?: string;
  likes_count: number;
  liked_by_users: string[];
  comments: GalleryComment[];
  created_by_id?: string;
  created_at: string;
}

export type Memory = MemoryPost;
export type CulturalPost = CulturalResource;

export interface MemoryComment {
  id: string;
  memory_id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  comment_text: string;
  created_at: string;
}

export interface MemoryPost {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  author_committee?: string;
  memory_text: string;
  image_url?: string;
  likes_count: number;
  liked_by_me?: boolean;
  liked_by_users?: string[];
  comments: MemoryComment[];
  created_at: string;
}

export interface MemberProject {
  id: string;
  user_id: string;
  author_name?: string;
  project_title: string;
  description: string;
  contact_phone?: string;
  social_link?: string;
  project_link?: string;
  image_url?: string;
  tags?: string[];
  is_approved: boolean;
  created_at: string;
}

export interface Internship {
  id: string;
  company_name: string;
  title: string;
  description: string;
  location?: string;
  apply_link: string;
  image_url?: string;
  deadline?: string;
  is_exclusive_to_members?: boolean;
  created_at: string;
}

export interface CulturalResource {
  id: string;
  section_name: string;
  title: string;
  description?: string;
  resource_url: string;
  resource_type: 'book' | 'article' | 'course' | 'tool';
  is_premium_only: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  target: string;
  previous_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface SiteSettings {
  recruitment_status: 'open' | 'closed' | 'close';
  recruitment_link?: string;
  pr_head_phone: string;
  pr_sub_phone: string;
  team_motto: string;
  announcement_banner?: string;
  announcement_active?: boolean;
  hero_headline?: string;
  hero_tagline?: string;
  hero_description?: string;
  recruitment_notice?: string;
  ir_max_members_limit: number; // Flexible IR quota
  supabase_auto_sync: boolean;
  warning_threshold: number; // e.g. 60
  warning_consecutive_months: number; // e.g. 1, 2, 3, 6
  evaluation_criteria: EvaluationCriterion[];
  whatsapp_templates: WhatsAppTemplate[];
  default_certificate_template?: string;
}
