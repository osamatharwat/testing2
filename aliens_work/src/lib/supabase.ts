import {createClient, SupabaseClient} from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'aliens_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) return JSON.parse(stored) as SupabaseConfig;
  } catch (error) {
    console.error('Error reading Supabase config:', error);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    autoSync: false,
  };
}

export function saveSupabaseConfig(config: Partial<SupabaseConfig>): void {
  const current = getSupabaseConfig();
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({...current, ...config}));
  supabaseClientInstance = null;
}

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  try {
    supabaseClientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseClientInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseConfig().url && getSupabaseConfig().anonKey);
}

export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string,
): Promise<{success: boolean; message: string}> {
  const url = customUrl || getSupabaseConfig().url;
  const key = customKey || getSupabaseConfig().anonKey;

  if (!url || !key) {
    return {success: false, message: 'يرجى إدخال Project URL وPublic Anon Key.'};
  }

  try {
    const client = createClient(url, key);
    const {error} = await client.from('site_settings').select('id', {count: 'exact', head: true});

    if (error && /invalid api key|jwt/i.test(error.message)) {
      return {success: false, message: 'مفتاح Supabase غير صالح.'};
    }

    return {success: true, message: 'تم الاتصال بمشروع Supabase بنجاح.'};
  } catch (error: any) {
    return {success: false, message: `فشل الاتصال: ${error?.message || 'خطأ غير معروف'}`};
  }
}

/**
 * Production recruitment path against the real Supabase schema.
 * This uses the public INSERT policy on applications; it never grants roles.
 */
export async function submitPublicApplication(input: {
  committeeKey: string;
  committeeName?: string;
  applicantName: string;
  applicantEmail?: string;
  phone: string;
  facultyLevel: string;
  answers: Record<string, string>;
  roleRequested: string;
}): Promise<{success: boolean; id?: number; error?: string}> {
  const client = getSupabaseClient();
  if (!client) return {success: false, error: 'Supabase غير مهيأ.'};

  const {data: userData} = await client.auth.getUser();
  const row = {
    committee_key: input.committeeKey,
    committee_name: input.committeeName || input.committeeKey,
    role_requested: input.roleRequested,
    applicant_name: input.applicantName,
    applicant_email: input.applicantEmail || null,
    phone: input.phone,
    faculty_level: input.facultyLevel,
    answers: input.answers,
    dynamic_answers: input.answers,
    status: 'new',
    source: 'public_web',
    user_id: userData.user?.id || null,
    score: 0,
  };

  const {data, error} = await client.from('applications').insert(row).select('id').single();
  if (error) return {success: false, error: error.message};
  return {success: true, id: data?.id};
}

/**
 * Legacy full-JSON sync has been replaced by the production migration in supabase/migrations_aliens_complete.sql.
 * The new runtime hydrates and persists through the normalized Supabase schema plus aliens_os_state.
 */
export async function pushAllDataToSupabase(): Promise<{success: boolean; details: string}> {
  try {
    const { persistRemoteCollection, persistProfile, persistApplication } = await import('./remoteStore');
    const mapping: Array<[string, string]> = [
      ['committees', 'aliens_committees_v5'],
      ['access_codes', 'aliens_access_codes_v5'],
      ['dynamic_questions', 'aliens_dynamic_questions_v5'],
      ['evaluations', 'aliens_evaluations_v5'],
      ['events', 'aliens_events_v5'],
      ['event_registrations', 'aliens_event_registrations_v5'],
      ['gallery', 'aliens_gallery_v5'],
      ['memories', 'aliens_memories_v5'],
      ['projects', 'aliens_projects_v5'],
      ['internships', 'aliens_internships_v5'],
      ['cultural', 'aliens_cultural_v5'],
      ['audit_logs', 'aliens_audit_logs_v5'],
      ['settings', 'aliens_settings_v5'],
      ['warnings', 'aliens_warnings_v5'],
      ['certificates', 'aliens_certificates_v5'],
    ];
    for (const [remoteKey, storageKey] of mapping) {
      const raw = localStorage.getItem(storageKey);
      if (raw) await persistRemoteCollection(remoteKey as any, JSON.parse(raw));
    }
    const profilesRaw = localStorage.getItem('aliens_profiles_v5');
    if (profilesRaw) {
      for (const profile of JSON.parse(profilesRaw)) await persistProfile(profile);
    }
    const applicationsRaw = localStorage.getItem('aliens_applications_v5');
    if (applicationsRaw) {
      for (const app of JSON.parse(applicationsRaw)) await persistApplication(app);
    }
    return { success: true, details: 'تم دفع بيانات الـCMS والـProfiles والـApplications الحالية إلى Supabase.' };
  } catch (error: any) {
    return { success: false, details: error?.message || 'فشل دفع البيانات إلى Supabase.' };
  }
}

export async function pullAllDataFromSupabase(): Promise<{success: boolean; details: string}> {
  try {
    const { hydrateRemoteState } = await import('./remoteStore');
    await hydrateRemoteState();
    window.dispatchEvent(new Event('aliens_store_change'));
    return { success: true, details: 'تم تحميل أحدث نسخة من Supabase إلى الذاكرة المحلية المؤقتة.' };
  } catch (error: any) {
    return { success: false, details: error?.message || 'فشل تحميل البيانات من Supabase.' };
  }
}

/**
 * Safe hardening SQL for the existing audited schema.
 * It intentionally does not create permissive public-write tables.
 */
export function getSupabaseSQLSchema(): string {
  return `-- ALIENS SPACE — SAFE SUPABASE HARDENING SCRIPT
-- Targets the existing schema found in the database audit.
-- No legacy aliens_* tables. No public write-all policies.

ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access to performance evaluations" ON public.performance_evaluations;
CREATE POLICY "performance_evaluations_read_scoped"
ON public.performance_evaluations FOR SELECT TO public
USING (
  auth.uid() = member_id
  OR auth.uid() = evaluator_id
  OR lower(coalesce(public.current_profile_role(), 'guest')) IN
     ('og','head','sub_head','ir','team_head','team_sub_head')
);

CREATE POLICY "performance_evaluations_manage_leadership"
ON public.performance_evaluations FOR ALL TO authenticated
USING (
  lower(coalesce(public.current_profile_role(), 'guest')) IN
  ('og','head','sub_head','ir','team_head','team_sub_head')
)
WITH CHECK (
  lower(coalesce(public.current_profile_role(), 'guest')) IN
  ('og','head','sub_head','ir','team_head','team_sub_head')
);

CREATE POLICY "role_permissions_read_leadership"
ON public.role_permissions FOR SELECT TO authenticated
USING (
  lower(coalesce(public.current_profile_role(), 'guest')) IN
  ('og','head','team_head','team_sub_head')
);

CREATE POLICY "role_permissions_manage_leadership"
ON public.role_permissions FOR ALL TO authenticated
USING (
  lower(coalesce(public.current_profile_role(), 'guest')) IN
  ('og','head','team_head','team_sub_head')
)
WITH CHECK (
  lower(coalesce(public.current_profile_role(), 'guest')) IN
  ('og','head','team_head','team_sub_head')
);

DROP POLICY IF EXISTS "Admins have full access to settings" ON public.site_settings;
DROP POLICY IF EXISTS "Head control settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public read settings" ON public.site_settings;

CREATE POLICY "site_settings_public_read"
ON public.site_settings FOR SELECT TO public USING (true);

CREATE POLICY "site_settings_leadership_write"
ON public.site_settings FOR ALL TO authenticated
USING (
  lower(coalesce(public.current_profile_role(), 'guest')) IN
  ('og','head','team_head','team_sub_head')
)
WITH CHECK (
  lower(coalesce(public.current_profile_role(), 'guest')) IN
  ('og','head','team_head','team_sub_head')
);

-- IMPORTANT: review any remaining permissive ALL/USING true policies on protected content.
`;
}
