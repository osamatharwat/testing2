import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import type { Profile, Application } from '../types';

/**
 * Supabase-backed persistence layer used as the cloud source of truth.
 * LocalStorage remains a synchronous UI cache because the legacy UI API is synchronous.
 * Hydration happens before React mounts; mutations are persisted asynchronously.
 */

export type RemoteStoreKey =
  | 'committees'
  | 'access_codes'
  | 'dynamic_questions'
  | 'evaluations'
  | 'events'
  | 'event_registrations'
  | 'gallery'
  | 'memories'
  | 'projects'
  | 'internships'
  | 'cultural'
  | 'audit_logs'
  | 'settings'
  | 'warnings'
  | 'certificates';

const STORE_TABLE = 'aliens_os_state';

const PUBLIC_READ_KEYS = new Set<RemoteStoreKey>([
  'committees',
  'dynamic_questions',
  'events',
  'gallery',
  'memories',
  'projects',
  'internships',
  'cultural',
  'settings',
]);

const LEADERSHIP_ROLES = new Set(['og', 'head', 'sub_head', 'team_head', 'team_sub_head']);

function isLeadership(profile: { role?: string } | null | undefined): boolean {
  return LEADERSHIP_ROLES.has(String(profile?.role || '').toLowerCase());
}

async function currentProfile(client: any): Promise<any | null> {
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await client.from('profiles').select('id,role').eq('id', data.user.id).maybeSingle();
  return profile || null;
}

export async function hydrateRemoteState(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  if (!client) return;

  try {
    // Public cloud state.
    const keys = [...PUBLIC_READ_KEYS];
    const { data: stateRows, error: stateError } = await client
      .from(STORE_TABLE)
      .select('store_key,payload,updated_at')
      .in('store_key', keys);

    if (!stateError && stateRows) {
      for (const row of stateRows) {
        const storageKey = storageKeyForRemote(row.store_key as RemoteStoreKey);
        if (storageKey && row.payload !== null && row.payload !== undefined) {
          localStorage.setItem(storageKey, JSON.stringify(row.payload));
        }
      }
    }

    // Leadership/private state is available only to authorized members.
    const profile = await currentProfile(client);
    if (isLeadership(profile)) {
      const { data: privateRows, error: privateError } = await client
        .from(STORE_TABLE)
        .select('store_key,payload,updated_at')
        .not('store_key', 'in', `(${keys.join(',')})`);
      if (!privateError && privateRows) {
        for (const row of privateRows) {
          const storageKey = storageKeyForRemote(row.store_key as RemoteStoreKey);
          if (storageKey && row.payload !== null && row.payload !== undefined) {
            localStorage.setItem(storageKey, JSON.stringify(row.payload));
          }
        }
      }
    }

    // Profiles and applications use the normalized production tables.
    const { data: profiles } = await client.from('profiles').select('*').order('created_at', { ascending: true });
    if (profiles?.length) {
      localStorage.setItem('aliens_profiles_v5', JSON.stringify(profiles.map(normalizeProfile)));
    }

    if (isLeadership(profile)) {
      const { data: applications } = await client.from('applications').select('*').order('created_at', { ascending: false });
      if (applications?.length) {
        localStorage.setItem('aliens_applications_v5', JSON.stringify(applications.map(normalizeApplication)));
      }
    }
  } catch (error) {
    console.error('[Aliens] remote hydration failed:', error);
  }
}

export function storageKeyForRemote(key: RemoteStoreKey): string | null {
  const map: Record<RemoteStoreKey, string> = {
    committees: 'aliens_committees_v5',
    access_codes: 'aliens_access_codes_v5',
    dynamic_questions: 'aliens_dynamic_questions_v5',
    evaluations: 'aliens_evaluations_v5',
    events: 'aliens_events_v5',
    event_registrations: 'aliens_event_registrations_v5',
    gallery: 'aliens_gallery_v5',
    memories: 'aliens_memories_v5',
    projects: 'aliens_projects_v5',
    internships: 'aliens_internships_v5',
    cultural: 'aliens_cultural_v5',
    audit_logs: 'aliens_audit_logs_v5',
    settings: 'aliens_settings_v5',
    warnings: 'aliens_warnings_v5',
    certificates: 'aliens_certificates_v5',
  };
  return map[key] || null;
}

export function remoteKeyForStorage(storageKey: string): RemoteStoreKey | null {
  const map: Record<string, RemoteStoreKey> = {
    aliens_committees_v5: 'committees',
    aliens_access_codes_v5: 'access_codes',
    aliens_dynamic_questions_v5: 'dynamic_questions',
    aliens_evaluations_v5: 'evaluations',
    aliens_events_v5: 'events',
    aliens_event_registrations_v5: 'event_registrations',
    aliens_gallery_v5: 'gallery',
    aliens_memories_v5: 'memories',
    aliens_projects_v5: 'projects',
    aliens_internships_v5: 'internships',
    aliens_cultural_v5: 'cultural',
    aliens_audit_logs_v5: 'audit_logs',
    aliens_settings_v5: 'settings',
    aliens_warnings_v5: 'warnings',
    aliens_certificates_v5: 'certificates',
  };
  return map[storageKey] || null;
}

export async function persistRemoteCollection(key: RemoteStoreKey, payload: unknown): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const profile = await currentProfile(client);
    const publicKey = PUBLIC_READ_KEYS.has(key);

    // Only leadership can replace cloud collections. Public interaction methods use dedicated RPCs/tables.
    if (!isLeadership(profile)) {
      if (publicKey) return;
      return;
    }

    const { error } = await client.from(STORE_TABLE).upsert({
      store_key: key,
      payload,
      updated_by: profile?.id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'store_key' });

    if (error) console.error(`[Aliens] cloud persist failed for ${key}:`, error);
  } catch (error) {
    console.error(`[Aliens] cloud persist failed for ${key}:`, error);
  }
}

export async function persistProfile(profile: Profile): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const row = {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url || null,
    role: profile.role,
    position: profile.position,
    committee: profile.committee || null,
    committee_key: profile.committee_key || profile.committee || null,
    committee_position: profile.committee_position || profile.position || null,
    bio: profile.bio || null,
    phone: profile.phone || null,
    faculty_level: profile.faculty_level || null,
    assigned_ir: profile.assigned_ir || null,
    is_active: profile.membership_status !== 'suspended',
    updated_at: new Date().toISOString(),
  };
  const { error } = await client.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) console.error('[Aliens] profile persist failed:', error);
}

export async function deleteProfileRemote(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const actor = await currentProfile(client);
  if (!isLeadership(actor)) return;
  const { error } = await client.from('profiles').delete().eq('id', id);
  if (error) console.error('[Aliens] profile delete failed:', error);
}

export async function persistApplication(app: Application): Promise<number | string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const actor = await currentProfile(client);
  const isPublicSubmission = !actor;
  if (!isPublicSubmission && !isLeadership(actor) && actor?.role !== 'ir') return null;

  const numericId = /^\d+$/.test(String(app.id)) ? Number(app.id) : undefined;
  const row: Record<string, any> = {
    committee_key: app.committee_key,
    committee_name: app.committee_name,
    role_requested: app.role_requested,
    applicant_name: app.applicant_name,
    applicant_email: (app as any).applicant_email || null,
    phone: app.phone,
    faculty_level: app.faculty_level,
    answers: app.dynamic_answers || {},
    dynamic_answers: app.dynamic_answers || {},
    status: app.status,
    user_id: (app as any).user_id || actor?.id || null,
    assigned_to: (app as any).assigned_to || null,
    assigned_ir_id: (app as any).assigned_ir_id || null,
    source: 'web_app',
    ir_decision: app.ir_decision,
    committee_decision: app.head_decision,
    final_status: app.status,
    ir_status: app.ir_decision === 'pending' ? 'pending' : app.ir_decision,
    committee_status: app.head_decision === 'pending' ? 'pending' : app.head_decision,
    final_decision_by: app.final_decision_by || null,
    final_decision_at: app.final_decision_date || null,
    decision_note: app.final_decision_note || null,
    updated_at: new Date().toISOString(),
  };

  if (numericId) row.id = numericId;
  const query = numericId
    ? client.from('applications').upsert(row, { onConflict: 'id' }).select('id').single()
    : client.from('applications').insert(row).select('id').single();
  const { data, error } = await query;
  if (error) {
    console.error('[Aliens] application persist failed:', error);
    return null;
  }
  return data?.id ?? null;
}

function normalizeProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email || '',
    username: row.username || row.email?.split('@')[0] || '',
    full_name: row.full_name || 'Aliens Member',
    avatar_url: row.avatar_url || undefined,
    role: String(row.role || 'guest').toLowerCase() as Profile['role'],
    position: row.position || row.committee_position || 'Member',
    committee: row.committee || row.committee_key || '',
    committee_key: row.committee_key || row.committee || '',
    committee_position: row.committee_position || row.position || undefined,
    membership_status: row.is_active === false ? 'suspended' : (String(row.role || 'guest').toLowerCase() === 'guest' ? 'guest' : 'active_member'),
    is_board_member: ['og','team_head','team_sub_head','head','sub_head'].includes(String(row.role || '').toLowerCase()),
    assigned_ir: row.assigned_ir || null,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || undefined,
    bio: row.bio || undefined,
    phone: row.phone || undefined,
    faculty_level: row.faculty_level || undefined,
  };
}

function normalizeApplication(row: any): Application {
  return {
    id: String(row.id),
    applicant_name: row.applicant_name || '',
    phone: row.phone || '',
    faculty_level: row.faculty_level || '',
    committee_key: row.committee_key || '',
    committee_name: row.committee_name || row.committee_key || '',
    dynamic_answers: row.dynamic_answers || row.answers || {},
    role_requested: row.role_requested || '',
    status: row.status || row.final_status || 'pending',
    shifted_from_committee: row.shifted_from_committee || undefined,
    ir_decision: row.ir_decision || 'pending',
    ir_evaluator_id: row.ir_evaluator_id || null,
    ir_evaluator_name: row.ir_evaluator_name || undefined,
    ir_decision_note: row.ir_decision_note || undefined,
    ir_decision_date: row.ir_decision_date || undefined,
    head_decision: row.head_decision || row.committee_decision || 'pending',
    head_evaluator_id: row.head_evaluator_id || undefined,
    head_evaluator_name: row.head_evaluator_name || undefined,
    head_decision_note: row.head_decision_note || undefined,
    head_decision_date: row.head_decision_date || undefined,
    final_decision_by: row.final_decision_by || undefined,
    final_decision_role: row.final_decision_role || undefined,
    final_decision_note: row.decision_note || undefined,
    final_decision_date: row.final_decision_at || undefined,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || undefined,
  };
}

export async function persistEventRegistration(reg: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('event_participations').insert({
    event_id: /^\d+$/.test(String(reg.event_id)) ? Number(reg.event_id) : reg.event_id,
    user_id: reg.user_id || null,
    user_name: reg.full_name,
    status: reg.status || 'confirmed',
    approved_by: null,
    approved_at: null,
    event_title: reg.event_title,
    email: reg.email,
    phone: reg.phone,
    faculty_level: reg.faculty_level,
    student_id: reg.student_id || null,
    ticket_code: reg.ticket_code,
    ticket_tier: reg.ticket_tier || null,
    price_paid: reg.price_paid ?? 0,
    notes: reg.notes || null,
    external_id: reg.id,
  });
  if (error) console.error('[Aliens] event registration persist failed:', error);
}

export async function persistGalleryComment(comment: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('gallery_comments').insert({
    image_name: String(comment.gallery_id),
    gallery_id: String(comment.gallery_id),
    user_name: comment.user_name,
    user_id: comment.user_id,
    user_avatar: comment.user_avatar || null,
    user_role: comment.user_role || 'member',
    comment_text: comment.comment_text,
    created_at: comment.created_at || new Date().toISOString(),
  });
  if (error) console.error('[Aliens] gallery comment persist failed:', error);
}

export async function toggleGalleryLikeRemote(galleryId: string, userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !userId) return;
  const exists = await client.from('gallery_likes').select('id').eq('image_name', String(galleryId)).eq('user_id', userId).maybeSingle();
  if (exists.data) {
    const { error } = await client.from('gallery_likes').delete().eq('id', exists.data.id);
    if (error) console.error('[Aliens] gallery unlike failed:', error);
  } else {
    const { error } = await client.from('gallery_likes').insert({ image_name: String(galleryId), user_id: userId });
    if (error) console.error('[Aliens] gallery like failed:', error);
  }
}

export async function persistMemory(memory: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const numericId = /^\d+$/.test(String(memory.id)) ? Number(memory.id) : undefined;
  const row: Record<string, any> = {
    author_name: memory.author_name,
    memory_text: memory.memory_text,
    is_approved: true,
    user_id: memory.user_id,
    image_url: memory.image_url || null,
    author_role: memory.author_role || 'member',
    author_avatar: memory.author_avatar || null,
    member_committee: memory.author_committee || null,
    liked_by_users: memory.liked_by_users || [],
    comments: memory.comments || [],
    created_at: memory.created_at || new Date().toISOString(),
  };
  if (numericId) row.id = numericId;
  const { error } = numericId
    ? await client.from('memories').upsert(row, { onConflict: 'id' })
    : await client.from('memories').insert(row);
  if (error) console.error('[Aliens] memory persist failed:', error);
}

export async function persistMemoryComment(comment: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !/^\d+$/.test(String(comment.memory_id))) return;
  const { error } = await client.from('memory_comments').insert({
    memory_id: Number(comment.memory_id),
    user_id: comment.user_id,
    author_name: comment.author_name,
    comment_text: comment.comment_text,
    created_at: comment.created_at || new Date().toISOString(),
  });
  if (error) console.error('[Aliens] memory comment persist failed:', error);
}

export async function toggleMemoryLikeRemote(memoryId: string, userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !userId || !/^\d+$/.test(String(memoryId))) return;
  const exists = await client.from('memory_likes').select('id').eq('memory_id', Number(memoryId)).eq('user_id', userId).maybeSingle();
  if (exists.data) {
    const { error } = await client.from('memory_likes').delete().eq('id', exists.data.id);
    if (error) console.error('[Aliens] memory unlike failed:', error);
  } else {
    const { error } = await client.from('memory_likes').insert({ memory_id: Number(memoryId), user_id: userId });
    if (error) console.error('[Aliens] memory like failed:', error);
  }
}

export async function deleteMemoryRemote(memoryId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !/^\d+$/.test(String(memoryId))) return;
  const { error } = await client.from('memories').delete().eq('id', Number(memoryId));
  if (error) console.error('[Aliens] memory delete failed:', error);
}
